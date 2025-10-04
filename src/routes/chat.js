const express = require("express");
const Chat = require("../models/chat");
const { userAuth } = require("../middlewares/auth");

const chatRouter = express.Router();

chatRouter.get("/:targetUserId", userAuth, async (req, res) => {
    const { targetUserId } = req.params;
    const userId = req.user._id;
    try {
        let chat = await Chat.findOne({
            participants: {$all: [userId, targetUserId]}
        })
        .populate({
            path: "message.senderId",
            select: "firstName lastName"
        })
        if(!chat){
            chat = new Chat({
                participants: [userId, targetUserId],
                messages: [],
            })
            await chat.save();
        }
        res.json(chat);
    } catch (err) {
        console.error(err);
    }
})

module.exports = chatRouter;