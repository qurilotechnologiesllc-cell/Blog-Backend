const express = require('express')
const router = express.Router()

const { UserLikesBlogs, SeenPostbyUser } = require('../controller/LikeController')

const { authMiddleware } = require('../middleware/authmiddleware')

router.post('/send/likes/:template_id', authMiddleware, UserLikesBlogs)

router.post('/seen/blog', authMiddleware, SeenPostbyUser)

module.exports = router