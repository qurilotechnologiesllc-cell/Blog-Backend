const express = require('express')
const router = express.Router()
const { AddCommentsToBlog, deleteCommentsofBlog } = require('../controller/commentsController')
const { authMiddleware } = require('../middleware/authmiddleware')

router.post('/add', authMiddleware, AddCommentsToBlog)

router.delete('/delete/:comment_id', deleteCommentsofBlog)

module.exports = router
