const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        // if (fromUserId.equals(toUserId)) { // done in pre schema middleware
        //     throw new Error("Cannot send connection request to yourself");
        // }

        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            throw new Error("invalid status request: " + status);
            // return res
            //     .status(400)
            //     .json({ message: "invalid status request: " + status });
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res
                .status(404)
                .json({ message: "User not found" });
        }

        // if there is an existing connection request or if other user has already sent the request
        const existingconnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { toUserId, fromUserId }, // Request from current user to target user
                { toUserId: fromUserId, fromUserId: toUserId }, // Request from target user to current user
            ],
        });
        if (existingconnectionRequest) {
            throw new Error("connection request already exist");
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });
        const data = await connectionRequest.save();
        res.json({
            message: req.user.firstName + " has succesfully " + status + " " + toUser.firstName,
            data,
        });
    } catch (err) {
        res.status(400).json({ message: `${err}` });
    }
});

module.exports = requestRouter;