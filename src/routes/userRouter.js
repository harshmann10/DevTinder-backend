const express = require("express");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const USER_SAFE_DATA =
    "firstName lastName photoUrl age gender about skills socialLinks";

// get all the pending connection request for the loggedIn user
userRouter.get("/requests/received", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId", USER_SAFE_DATA);
        res.json({ data: connectionRequest });
    } catch (err) {
        res.status(400).json({ message: `${err}` });
    }
});

// get all the accepted connection request for the loggedIn user
userRouter.get("/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequest = await ConnectionRequest.find({
            $or: [
                {
                    toUserId: loggedInUser._id,
                    status: "accepted",
                },
                {
                    fromUserId: loggedInUser._id,
                    status: "accepted",
                },
            ],
        })
            .populate("fromUserId", USER_SAFE_DATA)
            .populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequest.map((request) => {
            if (request.fromUserId.equals(loggedInUser._id)) {
                return request.toUserId;
            }
            return request.fromUserId;
        });
        res.json({ data });
    } catch (err) {
        res.status(400).json({ message: `${err}` });
    }
});

// get all the user profile
userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        const connectionRequest = await ConnectionRequest.find({
            $or: [
                {
                    toUserId: loggedInUser._id,
                },
                {
                    fromUserId: loggedInUser._id,
                },
            ],
        }).select("fromUserId toUserId");

        const hideUsersId = new Set();
        connectionRequest.forEach((req) => {
            hideUsersId.add(req.fromUserId.toString());
            hideUsersId.add(req.toUserId.toString());
        });

        const users = await User.find({
            $and: [
                { _id: { $nin: Array.from(hideUsersId) } },
                { _id: { $ne: loggedInUser._id } },
            ],
        })
            .select(USER_SAFE_DATA)
            .skip(skip)
            .limit(limit);
        res.json({ data: users });
    } catch (err) {
        res.status(400).json({ message: `${err}` });
    }
});

module.exports = userRouter;