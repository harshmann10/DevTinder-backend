const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { validateSignUp, validateLogin } = require("../utils/validation");

authRouter.post("/signup", async (req, res) => {
    try {
        // validation of data
        validateSignUp(req);

        const { FirstName, LastName, emailId, password } = req.body;
        // encrypt the password
        const passwordHash = await bcrypt.hash(password, 10);

        //creating a new instance of the User model
        const user = new User({
            FirstName,
            LastName,
            emailId,
            password: passwordHash,
        });
        await user.save();
        res.send("User Signup succesfully");
    } catch (err) {
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
            res.cookie("token", token, { maxAge: 7 * 24 * 60 * 60 * 1000 }); // set the token in cookies
            // res.cookie("token", token, { expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
            res.send("User logged-in successfuly");
        } else {
            throw new Error("Invalid Credentials");
        }
    } catch (err) {
        res.status(401).send("Login failed: " + err.message);
    }
});

authRouter.post("/logout", (req, res) => {
    // res.cookie("token", null,
    //     {
    //         maxAge: 0,
    //         expires: new Date(Date.now())
    //     });
    res.clearCookie("token");
    res.send(`Logout successful`);
})

module.exports = authRouter;