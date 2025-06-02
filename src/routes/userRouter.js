const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about";

// get all the pending connection request for the loggedIn user
userRouter.get("/requests/received", userAuth, async (req, res) => {
    try {
        const loggedIn = req.user;
        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedIn._id,
            status: "interested",
        }).populate("fromUserId", USER_SAFE_DATA);
        // .populate("fromUserId", ["firstName", "lastName"]);
        res.json({ "all pending request ": connectionRequest });
    } catch (err) {
        res.status(400).json({ message: `${err}` });
    }
});

// get all the accepted connection request for the loggedIn user
userRouter.get("/connections", userAuth, async (req, res) => {
    try {
        const loggedIn = req.user;
        const connectionRequest = await ConnectionRequest.find({
            $or: [
                {
                    toUserId: loggedIn._id,
                    status: "accepted",
                },
                {
                    fromUserId: loggedIn._id,
                    status: "accepted",
                },
            ],
        })
            .populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequest.map((data) => {
            if (data.fromUserId.equals(loggedIn._id)) {
                return data.toUserId;
            }
            return data.fromUserId;
        });
        res.json({ data });
    } catch (err) {
        res.status(400).json({ message: `${err}` });
    }
});

module.exports = userRouter;