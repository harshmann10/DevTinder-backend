const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const {
    validateEditprofile,
    validateEditPassword,
    validateResetPassword,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const { sendResetPasswordEmail, sendOtpEmail } = require("../utils/sendEmail");
const User = require("../models/user");
const validator = require("validator");
const crypto = require("crypto");
const fileUpload = require("../utils/fileUpload");
const cloudinary = require("../utils/cloudinary");
const { Readable } = require("stream");

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = Readable.from(buffer);
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );
        stream.pipe(uploadStream);
    });
};

//get profile data and check the jwt token with userAuth
profileRouter.get("/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res
            .status(401)
            .json({ message: "Getting profile data failed: " + err.message });
    }
});

profileRouter.patch(
    "/edit",
    userAuth,
    fileUpload.fields([
        { name: "photo", maxCount: 1 },
        { name: "background", maxCount: 1 },
    ]),
    async (req, res) => {
    try {
        if (!validateEditprofile(req)) {
            throw new Error("user is not permitted to edit");
        }

        // The frontend sends socialLinks as a JSON string because multipart
        // form-data does not support nested objects.
        if (typeof req.body.socialLinks === "string") {
            try {
                req.body.socialLinks = JSON.parse(req.body.socialLinks);
            } catch (err) {
                throw new Error("Invalid social links data");
            }
        }

        const loggedUser = req.user;
        const uploadedFiles = req.files || {};
        const photoFile = uploadedFiles.photo?.[0];
        const backgroundFile = uploadedFiles.background?.[0];

        if (photoFile) {
            const result = await uploadToCloudinary(
                photoFile.buffer,
                "devtinder/profiles"
            );
            loggedUser.photoUrl = result.secure_url;
        }

        if (backgroundFile) {
            const result = await uploadToCloudinary(
                backgroundFile.buffer,
                "devtinder/covers"
            );
            loggedUser.backgroundImage = result.secure_url;
        }

        const allowedUpdates = [
            "firstName",
            "lastName",
            "age",
            "gender",
            "about",
            "skills",
            "socialLinks",
            "backgroundImage",
        ];
        allowedUpdates.forEach((key) => {
            if (req.body[key] !== undefined) {
                loggedUser[key] = req.body[key];
            }
        });

        await loggedUser.save();
        res.json({
            message: `${loggedUser.firstName}, your profile updated successfully`,
            data: loggedUser,
        });
    } catch (err) {
        res.status(400).json({ message: "Error updating profile: " + err.message });
    }
});

profileRouter.patch("/edit/password", userAuth, async (req, res) => {
    try {
        validateEditPassword(req);
        const { currentPassword, newPassword } = req.body;
        const loggedUser = req.user;
        const isCurrentPasswordValid = await loggedUser.validatePassword(
            currentPassword
        );

        if (!isCurrentPasswordValid) {
            throw new Error("currentPassword is incorrect");
        }
        const isSameAsCurrentPassword = await loggedUser.validatePassword(
            newPassword
        );
        if (isSameAsCurrentPassword) {
            throw new Error(
                "New password cannot be the same as the current password"
            );
        }
        loggedUser.password = await bcrypt.hash(newPassword, 10);
        await loggedUser.save();
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        res.json({
            message: `${loggedUser.firstName}, your password is changed successfully please login again`,
        });
    } catch (err) {
        res.status(400).json({ message: "Password change failed: " + err.message });
    }
});

profileRouter.post("/forgot-password/email", async (req, res) => {
    try {
        const { emailId } = req.body;
        if (!emailId || !validator.isEmail(emailId)) {
            return res.status(400).json({ message: "A valid email is required." });
        }

        const user = await User.findOne({ emailId });
        if (user) {
            const resetToken = crypto.randomBytes(32).toString("hex");
            user.resetPasswordToken = crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");
            user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
            await user.save();

            // Best-effort: the token is already saved, so a mail outage must
            // not turn a successful request into a 500.
            sendResetPasswordEmail(user.emailId, resetToken).catch((err) =>
                console.error("RESET_EMAIL_ERROR:", err.message)
            );
        }
        res.status(200).json({
            message:
                "If an account with that email exists, a password reset link has been sent.",
        });
    } catch (err) {
        console.error("FORGOT_PASSWORD_ERROR:", err);
        res
            .status(500)
            .json({ message: "An internal error occurred. Please try again later." });
    }
});

profileRouter.post("/forgot-password/otp", async (req, res) => {
    try {
        const { emailId } = req.body;
        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
        user.resetOTP = crypto
            .createHash("sha256")
            .update(String(otp))
            .digest("hex"); // Hash OTP
        user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes
        await user.save();
        // Best-effort: the OTP is already saved, so a mail outage must not
        // turn a successful request into a 500.
        sendOtpEmail(user.emailId, otp).catch((err) =>
            console.error("OTP_EMAIL_ERROR:", err.message)
        );
        res.status(200).json({ message: "OTP sent to email" });
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Something went wrong. Please try again." });
    }
});

profileRouter.post("/forgot-password/otp-verify", async (req, res) => {
    try {
        const { emailId, otp, newPassword } = req.body;
        const user = await User.findOne({ emailId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if OTP has expired
        if (!user.resetOTPExpires || user.resetOTPExpires < Date.now()) {
            return res
                .status(400)
                .json({ message: "OTP has expired. Request a new one." });
        }

        const hashedOTP = crypto
            .createHash("sha256")
            .update(String(otp))
            .digest("hex");

        if (hashedOTP !== user.resetOTP) {
            return res
                .status(400)
                .json({ message: "Invalid OTP. Please try again." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetOTP = undefined;
        user.resetOTPExpires = undefined;

        await user.save();
        res.status(200).json({ message: "Password reset successfully." });
    } catch (err) {
        console.error(err);
        res
            .status(500)
            .json({ message: "Something went wrong. Please try again." });
    }
});

profileRouter.post("/reset-password/:token", async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res
                .status(400)
                .json({ message: "Invalid or expired link, genrate a new reset link" });
        }
        validateResetPassword(req);

        const isSameAsCurrentPassword = await user.validatePassword(newPassword);
        if (isSameAsCurrentPassword) {
            return res.status(400).json({
                message: "New password cannot be the same as the old password.",
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        res
            .status(200)
            .json({ message: "Password reset successful. You can now log in." });
    } catch (err) {
        console.error("RESET_PASSWORD_ERROR:", err);
        res
            .status(500)
            .json({ message: "An internal error occurred. Please try again later." });
    }
});

profileRouter.delete("/delete", userAuth, async (req, res) => {
    try {
        const loggedUser = req.user;
        await User.findByIdAndDelete(loggedUser._id);
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        res.json({
            message: `${loggedUser.firstName}, your account has been successfully deleted.`,
        });
    } catch (err) {
        res
            .status(500)
            .json({ message: "Account deletion failed: " + err.message });
    }
});

// Public profile data used by the chat header when a page is opened
// directly (for example after a refresh) instead of through the connections list.
profileRouter.get("/:userId", userAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select(
            "firstName lastName photoUrl backgroundImage age gender about skills socialLinks lastSeen"
        );
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: "Unable to load profile: " + err.message });
    }
});

module.exports = profileRouter;