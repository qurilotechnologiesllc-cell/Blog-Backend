const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp, role) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,

        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        },

        connectionTimeout: 30000,
        greetingTimeout: 30000,
        socketTimeout: 30000,
    });

    await transporter.verify();
    console.log("SMTP Connected Successfully");

    const mailOptions = {
        from: `"Blog App" <${process.env.MAIL_USER}>`,
        to: email,
        subject:
            role === "admin"
                ? "Admin Login OTP"
                : "Your OTP for Signup Verification",

        html: `
            <h2>${role === "admin"
                ? "Admin Login Verification"
                : "Email Verification"
            }</h2>

            <p>Your OTP is: <strong>${otp}</strong></p>

            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
        `
    };

    return await transporter.sendMail(mailOptions);
};

module.exports = sendOTPEmail;