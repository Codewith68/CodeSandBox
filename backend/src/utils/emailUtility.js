import nodemailer from 'nodemailer';
import {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
} from '../config/serverConfig.js';

/**
 * Create a reusable Nodemailer transporter
 * Uses Gmail SMTP by default — works with App Passwords
 *
 * Setup for Gmail:
 * 1. Enable 2-Step Verification on your Google account
 * 2. Go to https://myaccount.google.com/apppasswords
 * 3. Create an "App Password" for "Mail"
 * 4. Use that 16-char password as SMTP_PASS in .env
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(SMTP_PORT) || 587,
        secure: false, // true for 465, false for 587 (STARTTLS)
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
};

/**
 * Send an email
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email body in HTML
 * @param {string} [options.text] - Plain-text fallback
 */
export const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: SMTP_FROM || `"CodeForge" <${SMTP_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for plain-text fallback
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error(`❌ Failed to send email to ${to}:`, error.message);
        throw error;
    }
};

/**
 * Send a password reset email with a branded HTML template
 * @param {string} email - Recipient email
 * @param {string} resetLink - Full URL to the reset password page
 * @param {string} username - User's display name
 */
export const sendPasswordResetEmail = async (email, resetLink, username) => {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#0a0b10; font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:500px; margin:40px auto; padding:0;">
            <!-- Header -->
            <div style="text-align:center; padding:30px 0 20px;">
                <div style="display:inline-block; background:linear-gradient(135deg,#6366f1,#8b5cf6); width:48px; height:48px; border-radius:12px; line-height:48px; font-size:22px; margin-bottom:12px;">⚡</div>
                <div style="color:#ffffff; font-size:22px; font-weight:700;">
                    Code<span style="background:linear-gradient(90deg,#6366f1,#a78bfa); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">Forge</span>
                </div>
            </div>

            <!-- Card -->
            <div style="background:rgba(15,17,23,0.95); border:1px solid rgba(255,255,255,0.08); border-radius:16px; padding:32px; color:#e2e8f0;">
                <h2 style="margin:0 0 8px; font-size:20px; font-weight:700; color:#f1f5f9;">Reset Your Password</h2>
                <p style="margin:0 0 24px; font-size:14px; color:#64748b; line-height:1.6;">
                    Hey <strong style="color:#a5b4fc;">${username}</strong>, we received a request to reset your password.
                    Click the button below to set a new one.
                </p>

                <!-- CTA Button -->
                <div style="text-align:center; margin:28px 0;">
                    <a href="${resetLink}" style="display:inline-block; padding:14px 36px; background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#ffffff; text-decoration:none; border-radius:10px; font-weight:600; font-size:15px; letter-spacing:0.01em;">
                        Reset Password
                    </a>
                </div>

                <!-- Expiry notice -->
                <p style="margin:0 0 20px; font-size:13px; color:#475569; line-height:1.6;">
                    ⏱ This link expires in <strong style="color:#94a3b8;">15 minutes</strong>. If you didn't request this, you can safely ignore this email.
                </p>

                <!-- Fallback link -->
                <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.06); border-radius:8px; padding:12px; margin-top:16px;">
                    <p style="margin:0 0 6px; font-size:12px; color:#475569;">If the button doesn't work, copy and paste this link:</p>
                    <p style="margin:0; font-size:12px; color:#818cf8; word-break:break-all;">${resetLink}</p>
                </div>
            </div>

            <!-- Footer -->
            <div style="text-align:center; padding:24px 0; color:#334155; font-size:12px;">
                CodeForge © ${new Date().getFullYear()} — Cloud IDE for Modern Developers
            </div>
        </div>
    </body>
    </html>
    `;

    return sendEmail({
        to: email,
        subject: 'Reset Your Password — CodeForge',
        html,
    });
};
