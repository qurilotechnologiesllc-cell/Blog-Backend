const express = require("express")
const router = express.Router()

const { generateSeoforPost, previewSeoPost } = require("../controller/createSeoController")

router.post('/create', generateSeoforPost)
router.get('/preview/:id', previewSeoPost)

module.exports = router