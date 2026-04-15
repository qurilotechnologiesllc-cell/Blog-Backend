const { Schema, model } = require("mongoose")

const adminSchema = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: Number, required: true },
    role: { type: String, default: "admin" },
    profile_Image: { type: String, default: "" },
    public_key: { type: String, default: "" },
})

const Admin = model('Admin', adminSchema)

module.exports = Admin