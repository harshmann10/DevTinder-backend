const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

//get profile data and check the jwt token with userAuth
profileRouter.get("/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(401).send("getting profile data failed: " + err.message);
    }
});

module.exports = profileRouter;
