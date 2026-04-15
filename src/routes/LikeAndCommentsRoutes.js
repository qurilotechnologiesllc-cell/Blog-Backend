const express = require('express')
const router = express.Router()

const { UserLikesBlogs, SeenPostbyUser } = require('../controller/LikeAndCommentsController')

const { authMiddleware } = require('../middleware/authmiddleware')

router.post('/send/likes/:template_id', UserLikesBlogs)

router.post('/seen/blog', authMiddleware, SeenPostbyUser)

module.exports = router