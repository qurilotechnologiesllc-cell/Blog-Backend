const express = require('express');
const router = express.Router();
const {
    putDefaultSetting,
    getDefaultSetting,
    getCookieConsentSettings
} = require('../controller/admindefaultSettingController');

router.put('/default-setting', putDefaultSetting);
router.get('/default-setting', getDefaultSetting);
router.get('/default-setting/cookie-consent', getCookieConsentSettings);

module.exports = router;
