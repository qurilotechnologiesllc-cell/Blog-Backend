const BuilderTemplate = require("../models/builderTemplate.model")
const DefaultSetting = require("../models/defaultSetting.model")


const formatDateWithTimezone = (date, format, timezone) => {
  const options = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true // 👉 AM/PM format (agar 24hr chahiye toh false kar dena)
  }

  const parts = new Intl.DateTimeFormat("en-US", options)
    .formatToParts(new Date(date))

  const get = (type) => parts.find(p => p.type === type)?.value

  const day = get("day")
  const month = get("month")
  const year = get("year")
  const hour = get("hour")
  const minute = get("minute")
  const second = get("second")
  const dayPeriod = get("dayPeriod") // AM / PM

  let formattedDate

  switch (format) {
    case "DD/MM/YYYY":
      formattedDate = `${day}/${month}/${year}`
      break
    case "YYYY/MM/DD":
      formattedDate = `${year}/${month}/${day}`
      break
    case "MM/DD/YYYY":
    default:
      formattedDate = `${month}/${day}/${year}`
  }

  return `${formattedDate} ${hour}:${minute}:${second} ${dayPeriod}`
}

const normalizeSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")


const ensureUniqueSlug = async (slug, excludeId = null) => {
  let candidate = slug || "untitled-template"
  let count = 0

  while (true) {
    const lookup = count === 0 ? candidate : `${candidate}-${count}`
    const query = { slug: lookup }

    if (excludeId) {
      query._id = { $ne: excludeId }
    }

    const exists = await BuilderTemplate.findOne(query).select("_id")

    if (!exists) {
      return lookup
    }

    count += 1
  }
}

const makeUrls = (template) => ({
  previewPath: `/preview/${template._id}`,
  livePath: `/page/${template.slug}`,
})

const createBuilderTemplate = async (req, res) => {
  try {
    const { title, slug, description = "", content = { widgets: [] } } = req.body

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "title is required" })
    }

    const incomingSlug = normalizeSlug(slug || title)
    const uniqueSlug = await ensureUniqueSlug(incomingSlug)

    const template = await BuilderTemplate.create({
      title: title.trim(),
      slug: uniqueSlug,
      description: description.trim(),
      draftContent: content,
      status: "draft",
      author: req.user.userId,
      lastSavedAt: new Date(),
    })

    console.log(makeUrls(template));


    return res.status(201).json({
      message: "Builder template created",
      template,
      urls: makeUrls(template),
    })
  } catch (error) {
    console.error("Create Builder Template Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

const listBuilderTemplates = async (req, res) => {
  try {

    const query = { author: req.user.userId }

    const templates = await BuilderTemplate.find(query)
      .sort({ updatedAt: -1 })
      .select("title slug seen_count likes description comments template_thumbnail thumbnail_public_key status version publishedVersion lastSavedAt publishedAt createdAt updatedAt")

    return res.status(200).json({
      count: templates.length,
      templates,
    })
  } catch (error) {
    console.error("List Builder Templates Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

const getBuilderTemplateById = async (req, res) => {
  try {
    const { template_id } = req.params

    const template = await BuilderTemplate.findOne({ _id: template_id, author: req.user.userId })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    return res.status(200).json({
      template,
      urls: makeUrls(template),
    })
  } catch (error) {
    console.error("Get Builder Template Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

const updateBuilderDraft = async (req, res) => {
  try {
    const { template_id } = req.params
    const { title, slug, description, content } = req.body

    const template = await BuilderTemplate.findOne({ _id: template_id, author: req.user.userId })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    if (title !== undefined && title.trim()) {
      template.title = title.trim()
    }

    if (description !== undefined) {
      template.description = description.trim()
    }

    if (slug !== undefined) {
      const normalized = normalizeSlug(slug || template.title)
      template.slug = await ensureUniqueSlug(normalized, template._id)
    }

    if (content !== undefined) {
      template.draftContent = content
    }

    template.version += 1
    template.lastSavedAt = new Date()

    await template.save()

    return res.status(200).json({
      message: "Draft saved",
      template,
      urls: makeUrls(template),
    })
  } catch (error) {
    console.error("Update Builder Draft Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

const updatethumbnailTemplate = async (req, res) => {

  try {
    const { template_Id } = req.params

    // ── Check file was uploaded ────────────────────────────────────────────
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Thumbnail image is required',
      })
    }

    const imagefilename = req.file.filename.split("/")
    const public_key = imagefilename[imagefilename.length - 1]

    // ── Find the template ──────────────────────────────────────────────────
    const template = await BuilderTemplate.findById(template_Id)
    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      })
    }

    // ── Update thumbnail fields ────────────────────────────────────────────
    template.template_thumbnail = req.file.path        // full image URL / path
    template.thumbnail_public_key = public_key  // public key (e.g. cloudinary public_id)

    await template.save()

    return res.status(200).json({
      success: true,
      message: 'Thumbnail updated successfully',
      data: {
        template_thumbnail: template.template_thumbnail,
        thumbnail_public_key: template.thumbnail_public_key,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    })
  }
}

const SavedAsTemplate = async (req, res) => {
  try {
    const { template_id } = req.params

    const template = await BuilderTemplate.findOne({ _id: template_id, author: req.user.userId })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    template.status = "saved"
    await template.save()

    return res.status(200).json({
      message: "Template saved as draft",
      template,
      urls: makeUrls(template),
    })
  } catch (error) {
    console.error("Save As Template Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

const previewBuilderTemplate = async (req, res) => {
  try {
    const { template_id } = req.params

    const template = await BuilderTemplate.findOne({
      _id: template_id,
      author: req.user.userId
    }).select("draftContent publishedContent title slug description comments status version").populate('comments')


    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    return res.status(200).json({
      message: "Preview data fetched",
      templateId: template._id,
      status: template.status,
      version: template.version,
      content: template.draftContent,
      metadata: {
        title: template.title,
        slug: template.slug,
        description: template.description,
      },
      comments: template.comments,
      urls: makeUrls(template),
    })
  } catch (error) {
    console.error("Preview Builder Template Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

const publishBuilderTemplate = async (req, res) => {
  try {
    const { template_id } = req.params

    const template = await BuilderTemplate.findOne({ _id: template_id, author: req.user.userId })

    if (!template) {
      return res.status(404).json({ message: "Template not found" })
    }

    const isValid = template.draftContent.widgets.every(w => w.type && w.id)

    if (!isValid) {
      return res.status(400).json({ message: "Invalid widget structure" })
    }

    template.publishedContent = JSON.parse(JSON.stringify(template.draftContent))
    template.status = "published"
    template.publishedAt = new Date()
    template.publishedVersion = template.version

    await template.save()

    return res.status(200).json({
      message: "Template published successfully",
      urls: makeUrls(template),
    })
  } catch (error) {
    console.error("Publish Builder Template Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

const addTofavourite = async (req, res) => {
  try {
    const { template_id } = req.params
    const role = req.user.role

    // Step 1 — Role check karo
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." })
    }

    // Step 2 — Template exist karta hai ya nahi
    const template = await BuilderTemplate.findById(template_id)
    if (!template) {
      return res.status(404).json({ message: "Blog template not found" })
    }


    const updatedTemplate = await BuilderTemplate.findByIdAndUpdate(
      template_id,
      { $set: { 'isfavourite': !template.isfavourite } },
    )

    return res.status(200).json({
      message: `Blog ${updatedTemplate.isfavourite ? "added to" : "removed from"} favourites!`,
      isFavourite: updatedTemplate.isfavourite,
      blog: updatedTemplate
    })
  } catch (error) {
    console.error("Addto favourite Blog Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

const deleteBlogTemplate = async (req, res) => {
  try {
    const { template_id } = req.params
    const role = req.user.role

    // Step 1 — Role check karo
    if (role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." })
    }

    // Step 2 — template_id validate karo
    if (!template_id) {
      return res.status(400).json({ message: "template_id is required" })
    }

    // Step 3 — Blog find karo
    const blog = await BuilderTemplate.findById(template_id)
    if (!blog) {
      return res.status(404).json({ message: "Blog template not found" })
    }

    // // Step 4 — Cloudinary se image delete karo
    // if (blog.post_public_key) {
    //   const cloudinaryResult = await deleteFromCloudinary(blog.post_public_key)
    //   console.log("Cloudinary delete result:", cloudinaryResult)
    // }

    // Step 5 — DB se delete karo
    await BuilderTemplate.findByIdAndDelete(template_id)

    return res.status(200).json({
      message: "Blog template deleted successfully!",
      deleted_id: template_id
    })

  } catch (error) {
    console.error("Delete Blog Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

const getAllTemplateByStatus = async (req, res) => {
  try {
    const { status } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    // ✅ Step 0 — Fetch Default Settings
    let defaultSetting = await DefaultSetting.findOne()
    if (!defaultSetting) {
      defaultSetting = await DefaultSetting.create({})
    }

    const { showAuthorName, showpublishDate, dateformat, timezone } = defaultSetting

    // Step 1 — Validate status
    if (!status || !["published", "draft", "saved"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Use 'published', 'draft', or 'saved'"
      })
    }

    // Step 2 — Validate pagination params
    if (page < 1) {
      return res.status(400).json({
        message: "Page number must be greater than 0"
      })
    }

    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        message: "Limit must be between 1 and 100"
      })
    }

    const skip = (page - 1) * limit

    // Step 3 — Query
    let query = BuilderTemplate.find({ status })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-__v -updatedAt")

    // 👉 Conditionally populate author
    if (showAuthorName) {
      query = query.populate("author", "username email profile_Image")
    }

    const blogs = await query

    // 👉 Transform response based on settings
    const modifiedBlogs = blogs.map(blog => {
      const blogObj = blog.toObject()

      // ❌ Remove author if disabled
      if (!showAuthorName) {
        delete blogObj.author
      }

      // ❌ Handle publish date
      if (showpublishDate) {
        blogObj.publishDateFormatted = formatDateWithTimezone(
          blogObj.createdAt,
          dateformat,
          timezone
        )
      }

      return blogObj
    })
    

    const totalBlogs = await BuilderTemplate.countDocuments({ status })

    const totalPages = Math.ceil(totalBlogs / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    return res.status(200).json({
      message: `${status} blogs fetched successfully`,
      count: modifiedBlogs.length,
      status,
      blogs: modifiedBlogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        resultsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null
      }
    })

  } catch (error) {
    console.error("Get All Template Error:", error)
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message
    })
  }
}

// These two api fetch by User in user Dashboard
const getAllLiveTemplate = async (req, res) => {
  try {

    const template = await BuilderTemplate.find({
      status: "published",
    }).select("publishedContent title slug description comments publishedAt")


    if (template.length === 0) {
      return res.status(404).json({ message: "Live template not found" })
    }

    return res.status(200).json({
      message: "Live template fetched",
      metadata: template
    })
  } catch (error) {
    console.error("Get Live Template Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}

const searchblogbyTitle = async (req, res) => {
  try {
    const searchTitle = req.query.title.toLowerCase();


    const blog = await BuilderTemplate.findOne({
      title: { $regex: searchTitle, $options: 'i' } // Case-insensitive
    });
    return res.json(blog || { message: "Not found" });

  } catch (error) {
    console.error("Search blog Error:", error)
    return res.status(500).json({ message: "Internal Server Error", error: error.message })
  }
}


module.exports = {
  createBuilderTemplate,
  updateBuilderDraft,
  updatethumbnailTemplate,
  SavedAsTemplate,
  getBuilderTemplateById,
  previewBuilderTemplate,
  publishBuilderTemplate,
  getAllLiveTemplate,
  listBuilderTemplates,
  addTofavourite,
  searchblogbyTitle,
  deleteBlogTemplate,
  getAllTemplateByStatus
}
