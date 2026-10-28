// Brevo transactional email over HTTPS (port 443).
// Render free web services block outbound SMTP (25/465/587), so the HTTP API
// is used instead of an SMTP transport.
const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const REQUEST_TIMEOUT_MS = 10000;
const SENDER_NAME = "DevTinder Team";

const getSenderEmail = () => process.env.MAIL_FROM || process.env.GMAIL_USER;

const sendEmail = async (mailOptions) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = getSenderEmail();

    // Fail with an actionable message instead of a silent no-op when the
    // deployment is missing configuration.
    if (!apiKey) {
        throw new Error("Failed to send email. Reason: BREVO_API_KEY is not set");
    }
    if (!senderEmail) {
        throw new Error(
            "Failed to send email. Reason: MAIL_FROM (or GMAIL_USER) is not set"
        );
    }

    let response;
    try {
        response = await fetch(BREVO_API_URL, {
            method: "POST",
            headers: {
                "api-key": apiKey,
                "content-type": "application/json",
                accept: "application/json",
            },
            body: JSON.stringify({
                sender: { name: SENDER_NAME, email: senderEmail },
                to: [{ email: mailOptions.to }],
                subject: mailOptions.subject,
                htmlContent: mailOptions.html,
                ...(mailOptions.text ? { textContent: mailOptions.text } : {}),
            }),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
    } catch (error) {
        const reason =
            error.name === "TimeoutError"
                ? `request timed out after ${REQUEST_TIMEOUT_MS}ms`
                : error.message;
        console.error("Error sending email:", reason);
        throw new Error(`Failed to send email. Reason: ${reason}`);
    }

    if (!response.ok) {
        const raw = await response.text().catch(() => "");
        let detail = raw.slice(0, 300);
        try {
            detail = JSON.parse(raw).message || detail;
        } catch {
            // Non-JSON error body (e.g. an HTML error page): keep the snippet.
        }
        console.error(
            `Error sending email: Brevo responded ${response.status}`,
            detail
        );
        throw new Error(
            `Failed to send email. Reason: Brevo responded ${response.status}${
                detail ? ` - ${detail}` : ""
            }`
        );
    }

    const data = await response.json().catch(() => ({}));
    console.log(
        "Email sent successfully to:",
        mailOptions.to,
        "Message ID:",
        data.messageId
    );
    return { success: true, messageId: data.messageId };
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

const pingBrevoHealth = () => {
    if (!process.env.BREVO_API_KEY) return;
    fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": process.env.BREVO_API_KEY },
    })
        .then((res) => console.log(res.ok ? "Brevo connected (timer reset)" : `Brevo error: ${res.status}`))
        .catch(() => {});
};

module.exports = { sendResetPasswordEmail, sendWelcomeEmail, sendOtpEmail, pingBrevoHealth };