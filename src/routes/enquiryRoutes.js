const express = require('express')
const router = express.Router()

const { authMiddleware } = require('../middleware/authmiddleware')

const { sendEnquirytoAdmin, getAllEnquirybyAdmin, deleteEnquiryByAdmin, readEnquirybyAdmin, replyViaEmailbyAdmin } = require('../controller/enquiryController')

router.post('/user/send', sendEnquirytoAdmin)
router.get('/admin/all-enquiry', authMiddleware, getAllEnquirybyAdmin)
router.delete('/admin/delete-enquiry/:enquiry_id', authMiddleware, deleteEnquiryByAdmin)
router.put('/admin/read-enquiry/:enquiry_id', authMiddleware, readEnquirybyAdmin)
router.post('/admin/reply-to-message', replyViaEmailbyAdmin)

module.exports = router