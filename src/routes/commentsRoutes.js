const express = require('express')
const router = express.Router()
const { AddCommentsToBlog, deleteCommentsofBlog, getCommentsOfBlog } = require('../controller/commentsController')
const { authMiddleware } = require('../middleware/authmiddleware')

router.post('/add', authMiddleware, AddCommentsToBlog)

router.delete('/delete/:comment_id', deleteCommentsofBlog)

router.get('/get-all', authMiddleware, getCommentsOfBlog)

module.exports = router
