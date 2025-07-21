const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

const sendEmail = async (mailOptions) => {
    try {
        const options = {
            ...mailOptions,
            from: `"DevTinder Team" <${process.env.GMAIL_USER}>`,
        };

        const info = await transporter.sendMail(options);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending email:", error.message, error.stack);
        throw new Error(`Failed to send email. Reason: ${error.message}`);
    }
};

const sendResetPasswordEmail = async (to, resetToken) => {
    const subject = "Reset Your DevTinder Password";
    const resetUrl = `${process.env.ALLOWED_ORIGIN}/reset-password/${resetToken}`;
    const text = `Hello,

You have requested to reset your password for your DevTinder account.

Please click on the following link to reset your password:
${resetUrl}

This link is valid for 1 hour. If you did not request a password reset, please ignore this email.

Best regards,
The DevTinder Team`;
    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Reset Your DevTinder Password</h2>
        <p>Hello,</p>
        <p>You have requested to reset your password for your DevTinder account.</p>
        <p>Please click on the link below to reset your password:</p>
        <p style="margin-top: 20px; margin-bottom: 20px;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </p>
        <p>This link is valid for <strong>1 hour</strong>.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <hr>
        <p>Best regards,<br>The DevTinder Team</p>
    </div>`;

    return sendEmail({ to, subject, text, html });
};

const sendWelcomeEmail = async (to, firstName) => {
    const subject = "Welcome to the DevTinder community! 🎉";
    const text = `Welcome to Tinder for Devs, ${firstName}! 🚀

Thank you for signing up! We’re thrilled to have you in our developer community.

Connect with like-minded devs, share projects, and find your perfect coding match.

Need help? Contact Support: devtinder6@gmail.com

© 2025 DevTinder | All rights reserved.`;

    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Welcome to Tinder for Devs, ${firstName}! 🚀</h2>
        <p>Thank you for signing up! We’re thrilled to have you in our developer community.</p>
        <p>Connect with like-minded devs, share projects, and find your perfect coding match.</p>
        <hr>
        <p>Need help? Contact Support: <a href="mailto:devtinder6@gmail.com">devtinder6@gmail.com</a></p>
        <p><small>© 2025 DevTinder | All rights reserved.</small></p>
    </div>`;

    return sendEmail({ to, subject, text, html });
};

const sendOtpEmail = async (to, otp) => {
    const subject = "Your Access Code is Here!";
    const text = `Hello,

Use the code below to verify your account:

🔑 ${otp}

This code will expire in 10 minutes.
If you didn’t request this, you can ignore this email.

Best,  
Tinder for Devs Team`;

    const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Your Access Code is Here!</h2>
        <p>Use the code below to verify your account:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">🔑 ${otp}</p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn’t request this, you can ignore this email.</p>
        <hr>
        <p>Best,<br>Tinder for Devs Team</p>
    </div>`;

    return sendEmail({ to, subject, text, html });
};

module.exports = { sendResetPasswordEmail, sendWelcomeEmail, sendOtpEmail };