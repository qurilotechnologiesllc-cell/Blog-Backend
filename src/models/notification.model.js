const { Schema, model } = require("mongoose")
const mongoose = require("mongoose")

const notificationSchema = new Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        default: null,
        index: true
    },

    title: {
        type: String,
        required: true
    },

    message: {
        type: String
    },

    type: {
        type: String,
        enum: ['like', 'comment', 'share', 'new_blog', 'enquiry'],
        default: 'like',
        index: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true
    },

    userName: {
        type: String
    },

    isRead: {
        type: Boolean,
        default: false,
        index: true
    },

    readAt: {
        type: Date
    }
},
    { timestamps: true })

// Compound index for finding unread notifications
notificationSchema.index({ isRead: 1, createdAt: -1 })

const Notification = model("Notification", notificationSchema)

module.exports = Notification