const express = require("express")
const cors = require("cors")
const http = require('http')
const app = express()
const path = require("path")
const UserAuthRoutes = require("./routes/userAuthRoutes")
const AdminAuthRoutes = require("./routes/adminAuthRoutes")
const LikesRoutes = require("./routes/LikeRoutes")
const BuilderTemplateRoutes = require("./routes/builderTemplateRoutes")
const UploadTemplateImageRoutes = require("./routes/uploadImagesRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")
const commentsRoutes = require('./routes/commentsRoutes')
const enquiryRoutes = require('./routes/enquiryRoutes')
const admindefaultSettingRoutes = require('./routes/admindefaultSettingRoutes')

const { initSocket } = require('./utils/sockethandler')
const server = http.createServer(app)

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: "https://blog-cms-delta-nine.vercel.app",
    methods: ["GET", "POST", "PUT", "DELETE"]
}))

// Initialize Socket.IO
const io = initSocket(server)

// Make io available to routes
app.use((req, res, next) => {
    req.io = io
    next()
})

app.use(express.static(path.join(__dirname, "public")))

app.use("/api/auth", UserAuthRoutes)
app.use("/app/auth", AdminAuthRoutes)
app.use("/api/post", LikesRoutes)
app.use("/api/builder", BuilderTemplateRoutes)
app.use('/api/template', UploadTemplateImageRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/comment', commentsRoutes)
app.use('/api/enquiry', enquiryRoutes)
app.use('/api/admin', admindefaultSettingRoutes)

module.exports = { app, server }