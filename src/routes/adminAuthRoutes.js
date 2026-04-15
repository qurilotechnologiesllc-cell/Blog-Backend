const express = require("express")
const router = express.Router()
const { LoginAdmin, verifyAdminOtp, adminUpdateProfile } = require("../controller/adminAuthController")
const { uploadAdminProfile } = require("../utils/cloudinary")
const { authMiddleware } = require("../middleware/authmiddleware")

router.get("/admin/login/:email", LoginAdmin)

router.post("/admin/verify-otp", verifyAdminOtp)

router.put("/admin/update-profile", authMiddleware,  uploadAdminProfile.single('admin_profile'), adminUpdateProfile)

module.exports = router