const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({

    host: "smtp-relay.brevo.com",

    port: 587,

    secure: false,

    auth: {
        user: process.env.BREVO_LOGIN,
        pass: process.env.BREVO_PASS,
    },

    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
});

const sendOTPEmail = async (email, otp, role) => {

    try {

        await transporter.verify();

        const info = await transporter.sendMail({

            from: `"Blog App" <${process.env.BREVO_USER}>`,

            to: email,

            subject:
                role === "admin"
                    ? "Admin Login OTP"
                    : "Your OTP Verification",

            html: `
                <div style="font-family: Arial; padding: 20px;">

                    <h2>
                        ${role === "admin"
                    ? "Admin Login Verification"
                    : "Email Verification"
                }
                    </h2>

                    <p>Your OTP is:</p>

                    <h1 style="color: blue;">
                        ${otp}
                    </h1>

                    <p>
                        This OTP will expire in
                        <strong>10 minutes</strong>.
                    </p>

                </div>
            `
        });

        console.log("Email Sent:", info.messageId);

        return info;

    } catch (error) {

        console.log("Brevo Error:", error);

        throw error;
    }
};

module.exports = sendOTPEmail;