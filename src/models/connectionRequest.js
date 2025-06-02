const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema(
    {
        fromUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        toUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User model
            required: true,
        },
        status: {
            type: String,
            enum: {
                values: ["interested", "ignored", "accepted", "rejected"],
                message: `{VALUE} is incorrect status types`,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Creating a compound index on fromUserId and toUserId to get faster queries
connectionRequestSchema.index({ fromUserId: 1, toUserId: 1 });

// Pre-save middleware to validate that a user cannot send a connection request to themselves
connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;

    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        throw new Error("Cannot send connection request to yourself");
    }
    next();
});

module.exports = mongoose.model("ConnectionRequest", connectionRequestSchema);