const Comments = require('../models/comments.models')
const BuilderTemplate = require('../models/builderTemplate.model')

const AddCommentsToBlog = async (req, res) => {
    try {
        const { userId, blogId, name, text } = req.body

        const role = req.user.role

        if (role !== 'user') {
            return res.status(404).json({ message: 'Unauthrized only register user are commented on blog' })
        }

        // ── Validate required fields ───────────────────────────────────────────
        if (!userId || !blogId || !name || !text) {
            return res.status(400).json({
                success: false,
                message: 'userId, blogId, name and text are required',
            })
        }
        
        // ── Check blog exists ──────────────────────────────────────────────────
        const blog = await BuilderTemplate.findById(blogId)
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found',
            })
        }

        // ── Create the comment ─────────────────────────────────────────────────
        const comment = await Comments.create({ userId, blogId, name, text })

        // ── Push comment _id into blog.comments array ──────────────────────────
        await BuilderTemplate.findByIdAndUpdate(
            blogId,
            { $push: { comments: comment._id } },
            { new: true }
        )

        return res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
        })
    }
}

const deleteCommentsofBlog = async (req, res) => {
    try {
        const { comment_id } = req.params

        // ── Find the comment ───────────────────────────────────────────────────
        const comment = await Comments.findById(comment_id)
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found',
            })
        }

        const blogId = comment.blogId

        // ── Pull comment _id from blog's comments array ────────────────────────
        await BuilderTemplate.findByIdAndUpdate(
            blogId,
            { $pull: { comments: comment._id } }
        )

        // ── Delete comment from Comments collection ────────────────────────────
        await Comments.findByIdAndDelete(comment_id)

        return res.status(200).json({
            success: true,
            message: 'Comment deleted successfully',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
        })
    }
}

const getCommentsOfBlog = async (req, res) => {
    try {
        const role = req.user.role

        if (role !== 'admin') {
            return res.status(404).json({ message: 'Unauthrized only admin can view comments' })
        }

        // ── Find comments for the given blogId ─────────────────────────────────
        const comments = await Comments.find({}).populate('userId', 'name email profileImage') // Populate user details if needed

        return res.status(200).json({
            success: true,
            message: 'Comments retrieved successfully',
            data: comments,
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error',
        })
    }
}   

module.exports = { AddCommentsToBlog, deleteCommentsofBlog, getCommentsOfBlog }

