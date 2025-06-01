const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

// route to send a connection request to another user
requestRouter.post("/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        const allowedStatus = ["ignored", "interested"];
        if (!allowedStatus.includes(status)) {
            throw new Error("invalid status request: " + status);
        }

        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: "User not found" });
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
            message:
                req.user.firstName +
                " has succesfully " +
                status +
                " " +
                toUser.firstName,
            data,
        });
    } catch (err) {
        res.status(400).json({ message: `${err}` });
    }
});

// route to accept or reject a connection request
requestRouter.post("/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedUser = req.user;
        const { status, requestId } = req.params;

        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
            throw new Error("invalid status request: " + status);
        }

        // Check if the connection request exists and belongs to the logged-in user
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedUser._id,
            status: "interested",
        });
        if (!connectionRequest) {
            throw new Error("connection Request not found");
        }

        connectionRequest.status = status;
        const data = await connectionRequest.save();
        res.json({ message: "Connection Request is " + status, data });
    } catch (err) {
        res.status(400).json({ message: `${err}` });
    }
});

module.exports = requestRouter;