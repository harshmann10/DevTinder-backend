const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");

const getSecretRoomId = ({ userId, targetUserId }) => {
    return crypto.createHash("sha256").update([userId, targetUserId].sort().join("_")).digest("hex");
}

const initializeSocket = (server, allowedOrigin) => {
    const io = socket(server, {
        cors: {
            origin: allowedOrigin,
        },
    });

    io.on("connection", (socket) => {
        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const roomId = getSecretRoomId({ userId, targetUserId });
            console.log(firstName + " joined the room: " + roomId);
            socket.join(roomId);
        });

        socket.on("sendMessage", async ({ firstName, userId, targetUserId, text }) => {
            try {
                const roomId = getSecretRoomId({ userId, targetUserId });
                console.log(firstName + " " + text);
                let chat = await Chat.findOne({
                    participants: { $all: [userId, targetUserId] },
                })
                if (!chat) {
                    chat = new Chat({
                        participants: [userId, targetUserId],
                        message: []
                    });
                }
                chat.message.push({ senderId: userId, text });
                await chat.save();
                const savedMessage = chat.message[chat.message.length - 1];
                io.to(roomId).emit("messageReceived", { firstName, text, createdAt: savedMessage.createdAt });
            } catch (err) {
                console.log(err);
            }
        });

        socket.on("disconnect", () => { });
    });
};

module.exports = initializeSocket;