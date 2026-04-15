const express = require("express")
const router = express.Router()
const { uploadPostThumbnail } = require('../utils/cloudinary')

const {
  createBuilderTemplate,
  updateBuilderDraft,
  updatethumbnailTemplate,
  getBuilderTemplateById,
  previewBuilderTemplate,
  publishBuilderTemplate,
  getLiveTemplateBySlug,
  listBuilderTemplates,
  addTofavourite,
  searchblogbyTitle,
  deleteBlogTemplate,
  getAllTemplate
} = require("../controller/builderTemplateController")

const { authMiddleware } = require("../middleware/authmiddleware")

router.post("/template", authMiddleware, createBuilderTemplate)
router.get("/templates", authMiddleware, listBuilderTemplates)
router.put('/update/thumbnail/:template_Id', uploadPostThumbnail.single('post_thumbnail'), updatethumbnailTemplate)
router.get("/template/:template_id", authMiddleware, getBuilderTemplateById)
router.put("/template/:template_id/draft", authMiddleware, updateBuilderDraft)
router.get("/template/:template_id/preview", authMiddleware, previewBuilderTemplate)
router.post("/template/:template_id/publish", authMiddleware, publishBuilderTemplate)
router.get("/live/:slug", getLiveTemplateBySlug)
router.post("/add/to-favourite/:template_id", authMiddleware, addTofavourite)
router.get("/search-blog", searchblogbyTitle)
router.delete("/delete/blog-template/:template_id", authMiddleware, deleteBlogTemplate)
router.get("/get/blog-template/:status", getAllTemplate)

module.exports = router
