const cloudinary = require("cloudinary").v2
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const multer = require("multer")
const streamifier = require("streamifier")

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ============ FOLDER CONFIG ============
const getFolderConfig = (uploadType) => {
    const folders = {
        admin_profile: {
            folder: "blog/admin/profile",
            resource_type: "image",
            transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }]
        },
        post_image: {
            folder: "blog/posts/images",
            resource_type: "image",
            transformation: [{ width: 1200, crop: "limit" }]
        },
        post_thumbnail: {
            folder: "blog/posts/thumbnails",
            resource_type: "image",
            transformation: [{ width: 600, height: 400, crop: "fill" }]
        },
        user_profile: {
            folder: "blog/users/profile",
            resource_type: "image",
            transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }]
        },
        others: {
            folder: "blog/others",
            resource_type: "auto",
            transformation: []
        }
    }
    return folders[uploadType] || folders.others
}

// Har upload type ke liye alag storage instance
const createStorage = (uploadType) => {
    return new CloudinaryStorage({
        cloudinary,
        params: async (req, file) => {
            const config = getFolderConfig(uploadType)
            return {
                folder: config.folder,
                resource_type: config.resource_type,
                transformation: config.transformation,
                allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
                public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`
            }
        },
    })
}

// ✅ Memory storage — disk pe save nahi hoga, buffer mein rahega
const storage = multer.memoryStorage()

// ============ FILE FILTER ============
const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error(`File type not allowed: ${file.mimetype}`), false)
    }
}

// ============ MULTER INSTANCES — har type ke liye alag ============
const uploadAdminProfile = multer({
    storage: createStorage("admin_profile"),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }   // 5MB
})

const uploadPostImage = multer({
    storage: createStorage("post_image"),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }  // 10MB
})

const uploadPostThumbnail = multer({
    storage: createStorage("post_thumbnail"),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }   // 5MB
})

const uploadUserProfile = multer({
    storage: createStorage("user_profile"),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }   // 5MB
})

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }  // 10MB
})

// ============ DELETE FROM CLOUDINARY ============
const deleteFromCloudinary = async (public_id, resource_type = "image") => {
    try {
        if (!public_id) {
            throw new Error("public_id is required")
        }

        const result = await cloudinary.uploader.destroy(public_id, {
            resource_type  // image / video
        })

        // result.result === "ok"      → delete hua ✅
        // result.result === "not found" → already deleted tha
        if (result.result === "not found") {
            console.warn(`Cloudinary: File not found — ${public_id}`)
        }

        return result

    } catch (error) {
        console.error("Cloudinary Delete Error:", error)
        throw error
    }
}

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                transformation: [{ width: 1000, crop: "limit" }]
            },
            (error, result) => {
                if (error) reject(error)
                else resolve(result)
            }
        )
        streamifier.createReadStream(buffer).pipe(stream)
    })
}

module.exports = {
    cloudinary,
    upload,
    uploadAdminProfile,
    uploadPostImage,
    uploadPostThumbnail,
    uploadUserProfile,
    deleteFromCloudinary,
    uploadToCloudinary
}