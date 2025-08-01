const socket = require("socket.io");
const crypto = require("crypto")

const getSecretRoomId = ({userId, targetUserId}) => {
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
            const roomId = getSecretRoomId(userId, targetUserId);
            console.log(firstName + " joined the room: " + roomId);
            socket.join(roomId);
        });

        socket.on("sendMessage", ({ firstName, userId, targetUserId, newMessages }) => {
            const roomId = getSecretRoomId(userId, targetUserId);
            console.log(firstName + " " + newMessages);
            io.to(roomId).emit("messageReceived", { firstName, newMessages })
        });

        socket.on("disconnect", () => { });
    });
};

module.exports = initializeSocket;