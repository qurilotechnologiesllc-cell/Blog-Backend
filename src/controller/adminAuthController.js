const Admin = require("../models/admin.models")
const redis = require("../utils/redis")
const sendMail = require("../utils/sendmail")
const { cloudinary } = require("../utils/cloudinary")
const { generateToken } = require("../middleware/authmiddleware")

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

const LoginAdmin = async (req, res) => {
    try {
        const { email } = req.params  // ✅ params ki jagah body use karo

        // Step 1 — Validation
        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        // Step 2 — Admin DB mein email verify karo
        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(404).json({ message: "No admin found with this email" })
        }

        // Step 4 — OTP generate karo
        const otp = generateOTP()

        // Step 5 — OTP Redis mein save karo (10 min expiry)
        await redis.setex(`otp:admin:${email}`, 600, otp)

        // Step 6 — Email pe OTP bhejo
        await sendMail(email, otp, "admin")

        // Step 7 — Response
        return res.status(200).json({
            message: `OTP sent to ${email}. Please verify to login.`
        })

    } catch (error) {
        console.error("Admin Login Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const verifyAdminOtp = async (req, res) => {
    try {
        const { email, otp } = req.body

        // Step 1 — Validation
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" })
        }

        // Step 2 — Redis se OTP fetch karo
        const savedOTP = await redis.get(`otp:admin:${email}`)

        // Step 3 — OTP exist karta hai ya nahi
        if (!savedOTP) {
            return res.status(400).json({ message: "OTP expired. Please request again." })
        }

        // Step 4 — OTP match karo
        if (savedOTP !== otp.toString()) {
            // ❌ Wrong OTP — Redis se delete karo
            await redis.del(`otp:admin:${email}`)
            return res.status(400).json({ message: "Invalid OTP. Please request again." })
        }

        // Step 5 — Sahi OTP — Redis se delete karo
        await redis.del(`otp:admin:${email}`)

        // Step 6 — Admin DB mein find karo
        const admin = await Admin.findOne({ email })
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" })
        }

        // Step 7 — Token generate karo
        const payload = {
            userId: admin._id.toString(),
            email: admin.email,
            role: "admin"
        }

        const token = await generateToken(payload, res)

        // Step 8 — Response
        return res.status(200).json({
            message: "Login successful!",
            token,
            admin: {
                adminId: admin._id,
                name: admin.username,
                email: admin.email,
                Profile: admin.profile_Image,
                role: "admin"
            }
        })

    } catch (error) {
        console.error("Admin OTP Verify Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const adminUpdateProfile = async (req, res) => {
    try {
        const { username, phone, email } = req.body
        const adminId = req.user.userId  // auth middleware se aayega

        // Step 1 — Admin find karo
        const admin = await Admin.findById(adminId)
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" })
        }

        // Step 2 — Pehli image delete karo Cloudinary se (agar hai)
        if (req.file && admin.public_key) {
            await cloudinary.uploader.destroy(admin.public_key)
        }

        // Step 3 — Update object banao
        const updateData = {}

        if (username) updateData.username = username
        if (phone) updateData.phone = phone
        if (email) updateData.email = email

        // Step 4 — Nai image aai hai toh save karo
        if (req.file) {
            updateData.profile_Image = req.file.path      // Cloudinary URL
            updateData.public_key = req.file.filename  // Delete ke liye
        }

        // Step 5 — DB update karo
        const updatedAdmin = await Admin.findByIdAndUpdate(
            adminId,
            { $set: updateData }
        ).select("-__v")

        return res.status(200).json({
            message: "Profile updated successfully!",
            admin: updatedAdmin
        })

    } catch (error) {
        console.error("Admin Update Error:", error)
        if (req.file) {
            await cloudinary.uploader.destroy(req.file.filename)
        }
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

module.exports = { LoginAdmin, verifyAdminOtp, adminUpdateProfile }
