const { deleteFromCloudinary, uploadToCloudinary } = require("../utils/cloudinary")

const uploadtemplateImages = async (req, res) => {
    try {
        const profleImages = req.file?.buffer

        const role = req.user.role  // auth middleware se aayega

        if (role !== 'admin') {
            return res.status(404).json("Unauthorized role only admin can upload")
        }

        if (!profleImages) {
            return res.status(403).json({ message: "Images is required" })
        }
        const imageDetails = await uploadToCloudinary(profleImages, "blog/posts/images")

        if (!imageDetails) {
            return res.status(404).json({ message: "cloudinary error" })
        }

        res.status(200).json({
            success: true,
            data: {
                url: imageDetails.secure_url,
                public_key: imageDetails.display_name
            }
        })
    } catch (error) {
        if (req.file) {
            await deleteFromCloudinary(req.file.filename).catch(() => { })
        }
        console.error("Upload Images Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const deleteTemplateImages = async (req, res) => {
    try {
        const { public_key } = req.params
        const role = req.user.role  // auth middleware se aayega

        if (role !== 'admin') {
            return res.status(404).json("Unauthorized role only admin can upload")
        }

        if (!public_key) {
            return res.status(403).json({ message: "Public_Id is required" })
        }

        const response = await deleteFromCloudinary(public_key)

        if (!response) {
            return res.status(404).json("cloudinary server issue")
        }

        res.status(200).json({ success : true, message: 'Images Deleted Successsfully'})

    } catch (error) {
        console.error("delete Images Error:", error)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

module.exports = { uploadtemplateImages, deleteTemplateImages }