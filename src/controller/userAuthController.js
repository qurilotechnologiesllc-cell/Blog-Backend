const User = require("../models/user.models")
const redis = require("../utils/redis")
const sendMail = require("../utils/sendmail")
const bcrypt = require("bcrypt")
const { generateToken } = require("../middleware/authmiddleware")

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString() // 6 digit
}

// ============ SIGNUP CONTROLLER ============
const SignUpUser = async (req, res) => {
    try {
        const { name, email, password } = req.body

        // Step 1 — Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        // Step 2 — Check karo email already exist karta hai ya nahi
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(409).json({ message: "Email already registered" })
        }

        // Step 3 — OTP generate karo
        const otp = generateOTP()

        // Step 4 — Temp data Redis mein save karo (10 min expiry)
        const tempUserData = JSON.stringify({ name, email, password })
        await redis.setex(`temp:signup:${email}`, 600, tempUserData)  // 600 sec = 10 min

        // Step 5 — OTP Redis mein save karo (10 min expiry)
        await redis.setex(`otp:signup:${email}`, 600, otp)

        // Step 6 — OTP email pe bhejo
        await sendMail(email, otp, "user")

        // Step 7 — Response bhejo
        return res.status(200).json({
            message: `OTP sent to ${email}. Please verify to complete registration.`
        })

    } catch (error) {
        console.error("SignUp Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const VerifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body


        // Step 1 — Validation
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" })
        }

        // Step 2 — Redis se OTP fetch karo
        const savedOTP = await redis.get(`otp:signup:${email}`)

        // Step 3 — OTP exist karta hai ya nahi
        if (!savedOTP) {
            return res.status(400).json({ message: "OTP expired or not found. Please signup again." })
        }
        

        // Step 4 — OTP match karo
        if (savedOTP !== otp.toString()) {
            // ❌ Wrong OTP — dono keys delete karo
            await redis.del(`otp:signup:${email}`)
            await redis.del(`temp:signup:${email}`)
            return res.status(400).json({ message: "Invalid OTP. Please signup again." })
        }

        // Step 5 — Temp user data Redis se fetch karo
        const tempUserData = await redis.get(`temp:signup:${email}`)

        if (!tempUserData) {
            await redis.del(`otp:signup:${email}`)
            return res.status(400).json({ message: "Session expired. Please signup again." })
        }

        const { name, password } = JSON.parse(tempUserData)

        // Step 6 — User DB mein save karo
        const newUser = new User({
            name,
            email,
            password,       // pre save hook automatically hash karega
            isVerified: true
        })
        
        await newUser.save()

        // Step 7 — Redis se dono keys delete karo
        await redis.del(`otp:signup:${email}`)
        await redis.del(`temp:signup:${email}`)

        // Step 8 — Response
        return res.status(201).json({
            message: "Account created successfully!",
        })

    } catch (error) {
        console.error("OTP Verify Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

// ============ FORGOT PASSWORD CONTROLLER ============
const UserForgotPassword = async (req, res) => {
    try {
        const { email } = req.params

        // Step 1 — Validation
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        // Step 2 — Email DB mein exist karta hai ya nahi
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "No account found with this email" })
        }

        // Step 3 — Check karo account active aur verified hai ya nahi
        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated" })
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: "Account is not verified" })
        }

        // Step 4 — OTP generate karo
        const otp = generateOTP()

        // Step 5 — OTP Redis mein save karo (10 min expiry)
        await redis.setex(`otp:forgot:${email}`, 600, otp)

        // Step 6 — Email pe OTP bhejo
        await sendMail(email, otp, "user")

        // Step 7 — Response
        return res.status(200).json({
            message: `OTP sent to ${email}. Please verify to reset your password.`
        })

    } catch (error) {
        console.error("Forgot Password Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const verifyOtpAndChangePassword = async (req, res) => {
    try {
        const { email, otp, new_password } = req.body

        // Step 1 — Validation
        if (!email || !otp || !new_password) {
            return res.status(400).json({ message: "Email, OTP and new password are required" })
        }

        if (new_password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" })
        }

        // Step 2 — Redis se OTP fetch karo
        const savedOTP = await redis.get(`otp:forgot:${email}`)

        // Step 3 — OTP exist karta hai ya nahi
        if (!savedOTP) {
            return res.status(400).json({ message: "OTP expired. Please request again." })
        }

        // Step 4 — OTP match karo
        if (savedOTP !== otp.toString()) {
            // ❌ Wrong OTP — Redis se delete karo
            await redis.del(`otp:forgot:${email}`)
            return res.status(400).json({ message: "Invalid OTP. Please request again." })
        }

        // Step 5 — OTP sahi hai — Redis se delete karo
        await redis.del(`otp:forgot:${email}`)

        // Step 6 — User DB mein find karo
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        // Step 7 — Naya password hash karo
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(new_password, salt)

        await User.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true }
        )

        // Step 9 — Response
        return res.status(200).json({
            message: "Password updated successfully! Please login with your new password."
        })

    } catch (error) {
        console.error("Verify OTP & Change Password Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        // Step 1 — Validation
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        // Step 2 — User find karo — password bhi select karo (select: false hai schema mein)
        const user = await User.findOne({ email }).select("+password")
        if (!user) {
            return res.status(403).json({ message: "Invalid email or password" })
        }

        // Step 3 — Account checks
        if (!user.isVerified) {
            return res.status(403).json({ message: "Account not verified. Please verify your email." })
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated. Contact support." })
        }

        // Step 4 — Password compare karo
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(403).json({ message: "Invalid email or password" })
        }

        // Step 5 — Token generate karo
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            role: user.role
        }
        
        const token = await generateToken(payload, res);

        // Step 6 — Response
        return res.status(200).json({
            message: "Login successful!",
            token
        })

    } catch (error) {
        console.error("Login Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}


module.exports = { SignUpUser, VerifyOTP, UserForgotPassword, verifyOtpAndChangePassword, loginUser }