const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
            required: true,
        },
        orderId: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
        },
        receipt: {
            type: String,
        },
        notes: {
            firstName: String,
            lastName: String,
            membershipType: String,
            period: String,
        },
        status: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
