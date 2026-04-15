const express = require("express")
const router = express.Router()
const { SignUpUser, VerifyOTP, UserForgotPassword, verifyOtpAndChangePassword, loginUser } = require("../controller/userAuthController")

router.post("/user/signup", SignUpUser)
router.get("/user/login", loginUser)
router.get("/user/verify-otp", VerifyOTP)
router.get("/user/forgot-password/:email", UserForgotPassword)
router.put("/user/change-password", verifyOtpAndChangePassword)

module.exports = router