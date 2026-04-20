const BuilderTemplate = require("../models/builderTemplate.model")
const User = require("../models/user.models")
const Notification = require("../models/notification.model")
const redis = require('../utils/redis')

const UserLikesBlogs = async (req, res) => {
    try {
        const { template_id } = req.params
        const userId = req.user.userId

        const user = await User.findById(userId).select('name')
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        const guestName = user.name || "Guest"

        const blog = await BuilderTemplate.findById(template_id)

        if (!blog) {
            return res.status(404).json({ message: "Blog not found" })
        }

        await BuilderTemplate.findByIdAndUpdate(
            template_id,
            { $inc: { likes: 1 } },
        )

        // ✅ Save notification
        const notification = await Notification.create({
            blogId: blog._id,
            title: "New Like ❤️",
            message: `${user.name} liked your blog`,
            type: "like",
            userId: userId,
            userName: user.name
        })

        // 🔥 Emit to same room
        req.io.to("User_room").emit("new_notification", {
            message: notification.message,
            createdAt: notification.createdAt
        })

        res.status(200).json({
            success: true,
            message: "Like + Notification sent 💫"
        })

    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
}

const SeenPostbyUser = async (req, res) => {
    try {
        const { template_id } = req.body;
        const userIP = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const visitordata = req.user

        if (!template_id || !visitordata.userId || !visitordata.role === 'admin') {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // 1. Ek Unique Key banayein Redis Set ke liye
        // Key format: "seen:post:69d0ed9..."
        const redisKey = `seen:post:${template_id}`;

        // Value format: "visitordata-IP"
        const uniqueIdentifier = `${visitordata.userId}-${userIP}`;

        // 2. Redis SADD use karein
        // SADD returns 1 agar value nayi hai aur add ho gayi
        // SADD returns 0 agar value pehle se Set mein maujood hai
        const isNewView = await redis.sadd(redisKey, uniqueIdentifier);

        if (isNewView === 1) {
            // 3. Agar naya view hai, MongoDB mein count badhao ($inc)
            const updatedPost = await BuilderTemplate.findByIdAndUpdate(
                template_id,
                { $inc: { seen_count: 1 } },
                { new: true }
            );

            return res.status(200).json({
                message: "New view counted ✅",
                seen_count: updatedPost.seen_count
            });
        } else {
            // 4. Agar user pehle dekh chuka hai
            return res.status(200).json({
                message: "User already seen, count not increased ℹ️"
            });
        }

    } catch (error) {
        console.error("Error in SeenPostbyUser:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { UserLikesBlogs, SeenPostbyUser }