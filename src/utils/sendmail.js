const nodemailer = require("nodemailer")

// ============ SEND EMAIL FUNCTION ============
const sendOTPEmail = async (email, otp, role) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS   // Gmail App Password
        }
    })

    if (role === 'admin') {
        return await transporter.sendMail({
            from: `"Blog App" <${process.env.MAIL_USER}>`,
            to: email,
            subject: "Admin Login OTP",
            html: `
                <h2>Admin Login Verification</h2>
                <p>Your OTP is: <strong>${otp}</strong></p>
                <p>This OTP will expire in <strong>10 minutes</strong>.</p>
                <p>If you did not request this, please ignore this email.</p>
            `
        })
    }

    await transporter.sendMail({
        from: `"Blog App" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Your OTP for Signup Verification",
        html: `
            <h2>Email Verification</h2>
            <p>Your OTP is: <strong>${otp}</strong></p>
            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        `
    })
}

module.exports = sendOTPEmail