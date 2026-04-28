const BuilderTemplate = require("../models/builderTemplate.model")
const Enquiry = require("../models/enquiry.model")
const Comment = require("../models/comments.models")
const Notification = require("../models/notification.model")

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

const getAllNotification = async (req, res) => {
    try {
        const role = req.user.role

        if (role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized only admin have access to get all notification' })
        }

        const response = await Notification.find({isRead: false}, { 'message': 1, _id: 0 }).sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            notification: response
        })

    } catch (error) {
        console.error("fetch All notification error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const monthlyEngagementData = async (req, res) => {
    try {
        const role = req.user.role
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized' })
        }

        const year = parseInt(req.query.year) || new Date().getFullYear()

        const startDate = new Date(`${year}-01-01T00:00:00.000Z`)
        const endDate = new Date(`${year}-12-31T23:59:59.999Z`)

        // ── Comments per month ─────────────────────────────────────────────
        const commentsPerMonth = await Comment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    isDeleted: false
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        // ── Enquiries per month ────────────────────────────────────────────
        const enquiriesPerMonth = await Enquiry.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        // ── Likes per month ────────────────────────────────────────────────
        const likesPerMonth = await BuilderTemplate.aggregate([
            {
                $match: {
                    updatedAt: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: { $month: "$updatedAt" },
                    totalLikes: { $sum: "$likes" }
                }
            },
            { $sort: { _id: 1 } }
        ])

        // ── 12 months ka array banao ───────────────────────────────────────
        const months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ]

        const formatData = (data, key = 'count') =>
            months.map((_, index) => {
                const found = data.find(d => d._id === index + 1)
                return found ? found[key] : 0
            })

        const result = months.map((month, index) => {
            const commentFound = commentsPerMonth.find(d => d._id === index + 1)
            const enquiryFound = enquiriesPerMonth.find(d => d._id === index + 1)
            const likesFound = likesPerMonth.find(d => d._id === index + 1)

            return {
                month,
                comments: commentFound ? commentFound.count : 0,
                enquiries: enquiryFound ? enquiryFound.count : 0,
                likes: likesFound ? likesFound.totalLikes : 0,
            }
        })

        return res.status(200).json({
            success: true,
            year,
            data: result
        })

    } catch (error) {
        console.error("Monthly Engagement Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const seenNotificationByAdmin = async (req, res) => {
    try {
        const { notification_id } = req.params
        const role = req.user.role
        if (role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized Only Admin are Allowed to see notification' })
        }

        const response = await Notification.findByIdAndUpdate({ _id: notification_id }, { $set: { isRead: true } })
        if (!response) {
            return res.status(404).json({ message: "Not found" })
        }

        res.status(200).json({
            success: true,
            message: "Notification seen successfully!"
        })

    } catch (error) {
        console.error("notification seen error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}


module.exports = { getTotalPost, getTotalView, totalCommentsOnPost, latestblogContent, totalUserEnquiry, getAllNotification, monthlyEngagementData, seenNotificationByAdmin }