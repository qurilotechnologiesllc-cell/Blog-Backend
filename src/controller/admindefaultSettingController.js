const DefaultSetting = require('../models/defaultSetting.model');

const createDefaultSettingPayload = (payload = {}) => ({
    language: payload.language,
    timezone: payload.timezone,
    dateformat: payload.dateformat,
    showAuthorName: payload.showAuthorName,
    showpublishDate: payload.showpublishDate,
    cookieConsentEnabled: payload.cookieConsentEnabled,
    privacyPolicyUrl: payload.privacyPolicyUrl,
    cookieConsentVersion: payload.cookieConsentVersion,
    cookieConsentExpiryDays: payload.cookieConsentExpiryDays,
    cookieConsentBannerText: payload.cookieConsentBannerText,
    showCookieRejectButton: payload.showCookieRejectButton
})

const putDefaultSetting = async (req, res) => {
    try {
        const {
            language,
            timezone,
            dateformat,
            showAuthorName,
            showpublishDate,
            cookieConsentEnabled,
            privacyPolicyUrl,
            cookieConsentVersion,
            cookieConsentExpiryDays,
            cookieConsentBannerText,
            showCookieRejectButton
        } = req.body

        let defaultSetting = await DefaultSetting.findOne()

        if (!defaultSetting) {
            defaultSetting = new DefaultSetting(createDefaultSettingPayload({
                language,
                timezone,
                dateformat,
                showAuthorName,
                showpublishDate,
                cookieConsentEnabled,
                privacyPolicyUrl,
                cookieConsentVersion,
                cookieConsentExpiryDays,
                cookieConsentBannerText,
                showCookieRejectButton
            }))
        } else {
            defaultSetting.language = language || defaultSetting.language
            defaultSetting.timezone = timezone || defaultSetting.timezone
            defaultSetting.dateformat = dateformat || defaultSetting.dateformat
            defaultSetting.showAuthorName = showAuthorName !== undefined ? showAuthorName : defaultSetting.showAuthorName
            defaultSetting.showpublishDate = showpublishDate !== undefined ? showpublishDate : defaultSetting.showpublishDate
            defaultSetting.cookieConsentEnabled = cookieConsentEnabled !== undefined ? cookieConsentEnabled : defaultSetting.cookieConsentEnabled
            defaultSetting.privacyPolicyUrl = privacyPolicyUrl !== undefined ? privacyPolicyUrl : defaultSetting.privacyPolicyUrl
            defaultSetting.cookieConsentVersion = cookieConsentVersion || defaultSetting.cookieConsentVersion
            defaultSetting.cookieConsentExpiryDays = cookieConsentExpiryDays !== undefined ? cookieConsentExpiryDays : defaultSetting.cookieConsentExpiryDays
            defaultSetting.cookieConsentBannerText = cookieConsentBannerText || defaultSetting.cookieConsentBannerText
            defaultSetting.showCookieRejectButton = showCookieRejectButton !== undefined ? showCookieRejectButton : defaultSetting.showCookieRejectButton
        }

        await defaultSetting.save()
        res.status(200).json({ message: "Default settings updated successfully", data: defaultSetting })
    } catch (error) {
        console .error("Error updating default settings:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

const getDefaultSetting = async (req, res) => {
    try {
        let defaultSetting = await DefaultSetting.findOne()

        if (!defaultSetting) {
            defaultSetting = await DefaultSetting.create({})
        }

        res.status(200).json({ data: defaultSetting })
    } catch (error) {
        console.error("Error fetching default settings:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

const getCookieConsentSettings = async (req, res) => {
    try {
        let defaultSetting = await DefaultSetting.findOne()

        if (!defaultSetting) {
            defaultSetting = await DefaultSetting.create({})
        }

        res.status(200).json({
            data: {
                cookieConsentEnabled: defaultSetting.cookieConsentEnabled,
                privacyPolicyUrl: defaultSetting.privacyPolicyUrl,
                cookieConsentVersion: defaultSetting.cookieConsentVersion,
                cookieConsentExpiryDays: defaultSetting.cookieConsentExpiryDays,
                cookieConsentBannerText: defaultSetting.cookieConsentBannerText,
                showCookieRejectButton: defaultSetting.showCookieRejectButton
            }
        })
    } catch (error) {
        console.error("Error fetching cookie consent settings:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

module.exports = { putDefaultSetting, getDefaultSetting, getCookieConsentSettings }
