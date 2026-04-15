const express = require('express')

const router = express.Router()
const { getTotalPost, getTotalView, totalCommentsOnPost, latestblogContent, totalUserEnquiry } = require("../controller/dashboardController")
const { authMiddleware } = require('../middleware/authmiddleware')

router.get("/total-post-count", authMiddleware, getTotalPost)
router.get('/total-view-count', authMiddleware, getTotalView)
router.get('/total-comment-count', authMiddleware, totalCommentsOnPost)
router.get('/get-lastest-blog', authMiddleware, latestblogContent)
router.get('/get-all-count', authMiddleware, totalUserEnquiry)

module.exports = router