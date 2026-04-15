const express = require("express")
const router = express.Router()
const { uploadtemplateImages, deleteTemplateImages } = require("../controller/uploadimageController")
const { upload } = require("../utils/cloudinary")
const { authMiddleware } = require("../middleware/authmiddleware")

router.post("/upload-image", authMiddleware, upload.single('post_thumbnail'), uploadtemplateImages)

router.delete('/delete-image/:public_key', authMiddleware,  deleteTemplateImages)

module.exports = router