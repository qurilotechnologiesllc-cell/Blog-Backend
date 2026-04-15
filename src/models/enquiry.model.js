const { Schema, model } = require('mongoose')

const enquirySchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            index: true,   // frequent search by email
        },
        blogtitle: {
            type: String,
            required: true,
            trim: true,
            index: true,   // filter enquiries by blog
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ['Unread', 'Read', 'Replied', 'Archived'],
            default: 'Unread',
            index: true,   // filter by status in admin panel
        },
    },
    {
        timestamps: true,  // createdAt + updatedAt
    }
)

// ── Compound Indexes ───────────────────────────────────────────────────────────

// Admin panel: fetch all unread enquiries sorted by newest first
enquirySchema.index({ status: 1, createdAt: -1 })

// Search enquiries by a specific blog + status
enquirySchema.index({ blogtitle: 1, status: 1 })

// Lookup all enquiries from a specific email
enquirySchema.index({ email: 1, createdAt: -1 })

const Enquiry = model('Enquiry', enquirySchema)

module.exports = Enquiry