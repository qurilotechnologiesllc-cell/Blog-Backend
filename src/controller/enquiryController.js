const Enquiry = require('../models/enquiry.model')
const Notification = require('../models/notification.model')
const sendEnquiryReplyEmail = require('../utils/sendEnquiryReplyEmail')

const sendEnquirytoAdmin = async (req, res) => {
    try {
        const { name, email, blogtitle, message } = req.body

        if (!name || !email || !blogtitle || !message) {
            return res.status(404).json({ message: 'All field is required' })
        }

        const response = await Enquiry.create({ name, email, blogtitle, message })

        const notification = await Notification.create({
            blogId: null,
            title: "New Enquiry 📩",
            message: `${name} sent you an enquiry`,
            type: "enquiry",
            userId: null,
            userName: name
        })

        // Emit real-time notification to the blog owner
        req.io.to("User_room").emit("new_notification", {
            message: notification.message,
            createdAt: notification.createdAt
        })

        if (!response) {
            return res.status(404).json({ message: 'Invalid data' })
        }

        res.status(201).json({ success: true, message: "message sent successfully!" })
    } catch (error) {
        console.log("send enquiry api error :", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

const getAllEnquirybyAdmin = async (req, res) => {
    try {
        const role = req.user.role

        if (role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized role only admin can get all enquiry !' })
        }

        const response = await Enquiry.find({}).sort({ createdAt: -1 })

        if (!response) {
            return res.status(404).json({ message: 'Not found!' })
        }

        res.status(200).json({ success: true, message: 'fetch enquiry successfully !', response: response })

    } catch (error) {
        console.log("fetch enquiry api error :", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}


const deleteEnquiryByAdmin = async (req, res) => {
    try {
        const { enquiry_id } = req.params
        const role = req.user.role

        if (role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized role only admin can delete the enquiry!' })
        }
        const response = await Enquiry.findByIdAndDelete((enquiry_id))
        if (!response) {
            return res.status(404).json({ message: 'Not found!' })
        }
        res.status(200).json({ success: true, message: 'Enquiry Deleted Successfully !' })
    } catch (error) {
        console.log("delete enquiry api error :", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

const readEnquirybyAdmin = async (req, res) => {
    try {
        const { enquiry_id } = req.params

        if (!enquiry_id) {
            return res.status(404).json({ message: 'Enquiry Id is required!' })
        }

        const response = await Enquiry.findByIdAndUpdate({ _id: enquiry_id }, { $set: { status: 'Read' }, new: true })
        if (!response) {
            return res.status(404).json({ message: 'Not found!' })
        }
        res.status(200).json({ success: true, message: 'Successfully Update status' })
    } catch (error) {
        console.log("read enquiry api error :", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}

const replyViaEmailbyAdmin = async (req, res) => {
    try {
        const { email, subject, message, } = req.body

        if (!email || !subject || !message) {
            return res.status(404).json({ message: "All field are required!" })
        }
        const user = await Enquiry.findOne({ email })

        if (!user) {
            return res.status(404).json({ message: 'Not found!' })
        }

        console.log(user.name, user.blogtitle);


        const response = await sendEnquiryReplyEmail(email, subject, user.name, user.blogtitle, message)

        if (!response) {
            return res.status(403).json({ message: "send message failed !" })
        }

        res.status(200).json({ message: "send reply email successfully!" })

    } catch (error) {
        console.log("send reply email api error :", error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message })
    }
}


module.exports = { sendEnquirytoAdmin, getAllEnquirybyAdmin, deleteEnquiryByAdmin, readEnquirybyAdmin, replyViaEmailbyAdmin }