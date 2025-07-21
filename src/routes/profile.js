const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const {
    validateEditprofile,
    validateEditPassword,
    validateResetPassword,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const { sendResetPasswordEmail } = require("../utils/sendEmail");
const User = require("../models/user");
const validator = require("validator");
const crypto = require("crypto");

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

profileRouter.patch("/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditprofile(req)) {
            throw new Error("user is not permitted to edit");
        }
        const loggedUser = req.user;
        Object.keys(req.body).forEach((key) => (loggedUser[key] = req.body[key]));
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

profileRouter.post("/forgot-password", async (req, res) => {
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

            await sendResetPasswordEmail(user.emailId, resetToken);
        }
        res
            .status(200)
            .json({
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
            return res
                .status(400)
                .json({
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

module.exports = profileRouter;