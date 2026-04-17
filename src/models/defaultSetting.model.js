const { Schema, model } = require('mongoose')

const defaultSettingSchema = new Schema({
    language: {
        type: String,
        enum: ["English", "Spanish", "French", "German", "Chinese"],
        default: "English"
    },
    timezone: {
        type: String,
        enum: ["UTC", "GMT", "EST", "PST", "CST"],
        default: "UTC"
    },
    dateformat: {
        type: String,
        enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"],
        default: "MM/DD/YYYY"
    },
    theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light"
    },
    showAuthorName: {
        type: Boolean,
        default: true
    },
    showpublishDate: {
        type: Boolean,
        default: true
    },
    cookieConsentEnabled: {
        type: Boolean,
        default: true
    },
    privacyPolicyUrl: {
        type: String,
        default: ""
    },
    cookieConsentVersion: {
        type: String,
        default: "v1"
    },
    cookieConsentExpiryDays: {
        type: Number,
        default: 365,
        min: 1
    },
    cookieConsentBannerText: {
        type: String,
        default: "We use cookies to improve your experience. By clicking Accept All, you consent to our use of cookies."
    },
    showCookieRejectButton: {
        type: Boolean,
        default: true
    }
}, { timestamps: true })

const DefaultSetting = model('DefaultSetting', defaultSettingSchema)

module.exports = DefaultSetting
