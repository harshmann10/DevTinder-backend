const socket = require("socket.io");
const crypto = require("crypto");
const Chat = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");

const getSecretRoomId = ({ userId, targetUserId }) => {
    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");
};

const initializeSocket = (server, allowedOrigin) => {
    const io = socket(server, {
        cors: {
            origin: allowedOrigin,
        },
    });

    // In-memory object to track online users
    let onlineUsers = new Map();

    io.on("connection", (socket) => {
        socket.on("userConnected", async (userId) => {
            try {
                // Store userId on the socket for easy retrieval on disconnect
                socket.userId = userId;
                // Store user's socket ID and current time in the onlineUsers map
                onlineUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });

                const connections = await ConnectionRequest.find({
                    $or: [
                        { toUserId: userId, status: "accepted" },
                        { fromUserId: userId, status: "accepted" },
                    ],
                });
                const onlineFriendIds = [];

                connections.forEach((conn) => {
                    const friendId =
                        conn.fromUserId.toString() === userId
                            ? conn.toUserId.toString()
                            : conn.fromUserId.toString();
                    if (onlineUsers.has(friendId)) {
                        onlineFriendIds.push(friendId);
                        // Notify online friends that this user just came online
                        const friendSocketData = onlineUsers.get(friendId);
                        io.to(friendSocketData.socketId).emit("connectionOnline", userId);
                    }
                });

                io.to(socket.id).emit("onlineConnectionList", onlineFriendIds);
            } catch (err) {
                console.log("Error in userConnected event", err);
            }
        });

        socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
            const roomId = getSecretRoomId({ userId, targetUserId });
            console.log(firstName + " joined the room: " + roomId);
            socket.join(roomId);
        });

        socket.on(
            "sendMessage",
            async ({ firstName, userId, targetUserId, text }) => {
                try {
                    const roomId = getSecretRoomId({ userId, targetUserId });
                    console.log(firstName + " " + text);

                    const connection = await ConnectionRequest.findOne({
                        $or: [
                            {
                                fromUserId: userId,
                                toUserId: targetUserId,
                                status: "accepted",
                            },
                            {
                                fromUserId: targetUserId,
                                toUserId: userId,
                                status: "accepted",
                            },
                        ],
                    });

                    if (!connection) {
                        throw new Error("No connection found between users.");
                    }

                    let chat = await Chat.findOne({
                        participants: { $all: [userId, targetUserId] },
                    });
                    if (!chat) {
                        chat = new Chat({
                            participants: [userId, targetUserId],
                            message: [],
                        });
                    }
                    chat.message.push({ senderId: userId, text });
                    await chat.save();
                    const savedMessage = chat.message[chat.message.length - 1];
                    io.to(roomId).emit("messageReceived", {
                        firstName,
                        text,
                        createdAt: savedMessage.createdAt,
                    });
                } catch (err) {
                    console.log(err);
                }
            }
        );

        socket.on("disconnect", async () => {
            try {
                const userId = socket.userId;
                if (!userId) return;

                onlineUsers.delete(userId);

                const connections = await ConnectionRequest.find({
                    $or: [
                        { toUserId: userId, status: "accepted" },
                        { fromUserId: userId, status: "accepted" },
                    ],
                });

                const lastSeen = new Date();
                await User.findByIdAndUpdate(userId, { lastSeen });

                connections.forEach((conn) => {
                    const friendId =
                        conn.fromUserId.toString() === userId
                            ? conn.toUserId.toString()
                            : conn.fromUserId.toString();
                    if (onlineUsers.has(friendId)) {
                        const friendSocketData = onlineUsers.get(friendId);
                        io.to(friendSocketData.socketId).emit("connectionOffline", { userId, lastSeen });
                    }
                });
            } catch (err) {
                console.log("Error in disconnect event", err);
            }
        });
    });
};

module.exports = initializeSocket;