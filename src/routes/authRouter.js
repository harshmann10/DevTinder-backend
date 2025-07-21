const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUp, validateLogin } = require("../utils/validation");
const { sendWelcomeEmail } = require("../utils/sendEmail");

authRouter.post("/signup", async (req, res) => {
    try {
        validateSignUp(req);

        const {
            firstName,
            lastName,
            emailId,
            password,
            age,
            gender,
            about,
            skills,
        } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);

        //creating a new instance of the User model
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            age,
            gender,
            about,
            skills,
        });
        const savedUser = await user.save();
        await sendWelcomeEmail(savedUser.emailId, savedUser.firstName);
        const token = await savedUser.getJWT(); // Create a JWT token with Schema.methods function
        res.cookie("token", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "None",
            secure: true,
        });
        res.json({ messages: "User Signup succesfully", data: savedUser });
    } catch (err) {
        // Check for duplicate key error (unique constraint violation)
        if (err.code === 11000) {
            return res.status(400).send("An account with this email already exists.");
        }

        // Check if this is a Mongoose validation error
        if (err.name === "ValidationError") {
            // Extract the first error message for a cleaner response
            const messages = Object.values(err.errors).map((val) => val.message);
            return res.status(400).send(messages[0]);
        }
        res.status(400).send("Error Signup with User: " + err.message);
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        validateLogin(req);
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("Invalid Credentials");
        }

        const isPasswordValid = await user.validatePassword(password); // using Schema.methods function to validate password
        if (isPasswordValid) {
            const token = await user.getJWT(); //create a JWT token with Schema.methods function
            res.cookie("token", token, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true,
                sameSite: "None",
                secure: true,
            });
            res.json(user);
        } else {
            throw new Error("Invalid Credentials");
        }
    } catch (err) {
        res.status(401).send(err.message);
    }
});

authRouter.post("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
    res.send(`Logout successful`);
});

module.exports = authRouter;