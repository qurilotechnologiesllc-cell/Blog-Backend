const express = require("express")
const router = express.Router()
const { SignUpUser, VerifyOTP, UserForgotPassword, verifyOtpAndChangePassword, loginUser, updateUserProfile, logoutUser } = require("../controller/userAuthController")
const { uploadUserProfile } = require('../utils/cloudinary')
const { authMiddleware } = require("../middleware/authmiddleware")

router.post("/user/signup", SignUpUser)
router.get("/user/login", loginUser)
router.get("/user/verify-otp", VerifyOTP)   
router.get("/user/forgot-password/:email", UserForgotPassword)
router.put("/user/change-password", verifyOtpAndChangePassword)
router.put("/user/update-profile", authMiddleware, uploadUserProfile.single('user_profile'), updateUserProfile)
router.post("/user/logout", authMiddleware, logoutUser)

module.exports = router