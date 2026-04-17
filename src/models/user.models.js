const { Schema, model } = require("mongoose")
const bcrypt = require("bcrypt")

const userSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: { type: String, required: true, minlength: 6, select: false },
        role: {
            type: String,
            enum: ["admin", "user"], // Aapne kaha ek admin aur baaki user
            default: "user",
        },
        profileImage: { type: String, default: "" },
        publicId: { type: String, default: "" },
        isVerified: {
            type: Boolean,
            default: false
        },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
)

userSchema.pre('save', async function (next) {
    try {
        if (!this.isModified('password')) {
            return next
        }

        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
        next
    } catch (error) {
        next(error)
    }
})

const User =  model('User', userSchema)

module.exports = User