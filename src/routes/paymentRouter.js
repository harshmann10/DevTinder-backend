const express = require("express");
const paymentRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payments");
const { membershipAmount } = require("../utils/constant");
const {
    validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const crypto = require("crypto");
const User = require("../models/user");

paymentRouter.post("/create", userAuth, async (req, res) => {
    const { type, period } = req.body;
    const { firstName, lastName, emailId } = req.user;
    try {
        const amount = membershipAmount[type][period] * 100;
        const order = await razorpayInstance.orders.create({
            amount,
            currency: "INR",
            receipt: `receipt_order_${crypto.randomBytes(8).toString("hex")}`,
            notes: {
                firstName,
                lastName,
                emailId,
                membershipType: type,
                period,
            },
        });

        const payment = new Payment({
            userId: req.user._id,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
            status: order.status,
        });
        const savedPayment = await payment.save();
        res.json({ ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
    } catch (err) {
        return res.status(500).json({ msg: err.message });
    }
});

paymentRouter.post("/webhook", async (req, res) => {
    const webhookSignature = req.get("X-Razorpay-Signature");
    try {
        const isWebHookValid = validateWebhookSignature(
            JSON.stringify(req.body),
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if (!isWebHookValid) {
            return res.status(400).json({ msg: "Webhook signature is invalid" });
        }

        const paymentDetails = req.body.payload.payment.entity;

        console.log(paymentDetails);

        const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
        if (!payment) {
            return res.status(404).json({ msg: "Payment record not found" });
        }

        if (req.body.event == "payment.captured") {
            payment.status = paymentDetails.status;
            const user = await User.findById(payment.userId);
            if (user) {
                user.isPremium = true;
                user.membershipType = payment.notes.membershipType;
                const period = payment.notes.period; // 'monthly' or 'yearly'
                const validity = new Date();
                if (period == "monthly") {
                    validity.setMonth(validity.getMonth() + 1);
                } else if (period == "yearly") {
                    validity.setFullYear(validity.getFullYear() + 1);
                }
                user.membershipValidity = validity;
                await user.save();
            }
        } else if (req.body.event == "payment.failed") {
            payment.status = paymentDetails.status;
        }

        await payment.save();

        res.status(200).json({ msg: "Webhook received successfully" });
    } catch (error) {
        return res.status(500).json({ msg: error.message });
    }
});

paymentRouter.get("/verify", userAuth, async (req, res) => {
    const user = req.user;
    if(user.isPremium) {
        return res.json({ isPremium: true, membershipType: user.membershipType, membershipValidity: user.membershipValidity });
    }
    return res.json({ isPremium: false });
});

module.exports = paymentRouter;