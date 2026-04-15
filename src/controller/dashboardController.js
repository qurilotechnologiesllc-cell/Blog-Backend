const BuilderTemplate = require("../models/builderTemplate.model")
const Enquiry = require("../models/enquiry.model")

const getTotalPost = async (req, res) => {
    try {
        const role = req.user.role
        if (role !== 'admin') {
            return res.status(404).json({ message: "Unauthorized Only admin access it" })
        }
        const response = await BuilderTemplate.countDocuments({});
        res.status(200).json({
            success: true,
            total_Post: response
        })
    } catch (error) {
        console.error("Get All Template Count Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const getTotalView = async (req, res) => {
    try {
        const role = req.user.role
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized Only Admin are Allowed to see views' })
        }

        const response = await BuilderTemplate.find({}, { seen_count: 1, _id: 0 })

        const totalViews = response.reduce((acc, curr) => {
            return acc + curr.seen_count
        }, 0)

        res.status(200).json({
            success: true,
            totalViews: totalViews
        })

    } catch (error) {
        console.error("get all view error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const totalCommentsOnPost = async (req, res) => {
    try {
        const role = req.user.role
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized only admin has allowed to view comments' })
        }
        const response = await BuilderTemplate.find({}).select('comments')

        const Comments = response.map((blog) => {
            return blog.comments.length
        })

        const totalComments = Comments.reduce((acc, curr) => {
            return acc + curr
        }, 0)

        res.status(200).json({
            success: true,
            totalComments: totalComments
        })
    } catch (error) {
        console.error("get all comments error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const latestblogContent = async (req, res) => {
    try {
        const role = req.user.role
        if (role !== 'admin') {
            return res.status(404).json({ message: 'Unauthorized Only Admin has to access to see the latest blog' })
        }

        const response = await BuilderTemplate.find({}, { 'title': 1, 'status': 1, 'updatedAt': 1 }).sort({ updatedAt: -1 })

        res.status(200).json({
            success: true,
            latestBlog: response
        })

    } catch (error) {
        console.error("fetch latest blog error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const totalUserEnquiry = async (req, res) => {
    try {
        const role = req.user.role

        if (role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized only admin have access to get total enquiry' })
        }

        const response = await Enquiry.countDocuments({})

        res.status(200).json({
            success: true,
            totalEnquiry: response
        })

    } catch (error) {
        console.error("fetch All enquiry error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

module.exports = { getTotalPost, getTotalView, totalCommentsOnPost, latestblogContent, totalUserEnquiry }