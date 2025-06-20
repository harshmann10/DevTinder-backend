const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditprofile, validateEditPassword } = require("../utils/validation");
const bcrypt = require("bcrypt");

//get profile data and check the jwt token with userAuth
profileRouter.get("/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(401).send("getting profile data failed: " + err.message);
    }
});

profileRouter.patch("/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditprofile(req)) {
            throw new Error("user is not permitted to edit");
        };
        const loggedUser = req.user;
        Object.keys(req.body).forEach((key) => (loggedUser[key] = req.body[key]))
        await loggedUser.save();
        res.json({
            message: `${loggedUser.firstName}, your profile updated successfully`,
            data: loggedUser
        })
    } catch (err) {
        res.status(401).send("profile data edit failed: " + err.message);
    }
});

profileRouter.patch("/password", userAuth, async (req, res) => {
    try {
        validateEditPassword(req);
        const { currentPassword, newPassword } = req.body;
        const loggedUser = req.user;
        const isCurrentPasswordValid = await loggedUser.validatePassword(currentPassword);

        if (!isCurrentPasswordValid) {
            throw new Error("currentPassword is incorrect");
        }
        // if (currentPassword === newPassword) {
        //     throw new Error("currentPassword anb newPassword are same");
        // }
        const isSameAsCurrentPassword = await bcrypt.compare(newPassword, loggedUser.password);
        if (isSameAsCurrentPassword) {
            throw new Error("New password cannot be the same as the current password");
        }
        loggedUser.password = await bcrypt.hash(newPassword, 10);
        await loggedUser.save();
        res.clearCookie("token"); // clearing the jwt token and cookies
        res.json({
            message: `${loggedUser.firstName}, your password is changed successfully please login again`
        })
    } catch (err) {
        res.status(401).send("password change failed: " + err.message);
    }
})

module.exports = profileRouter;