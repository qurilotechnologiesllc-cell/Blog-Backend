const { Schema, model } = require("mongoose")

const builderTemplateSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    template_thumbnail: {
      type: String,
      default: "",
    },
    thumbnail_public_key: {
      type: String,
      default: "",
    },
    seen_count: {
      type: Number,
      default: 0,
      index: true  // Index for sorting by views
    },
    likes: {
      type: Number,
      default: 0,
      index: true  // Index for sorting by likes
    },
    isfavourite: {
      type: Boolean,
      default: false,
    },
    draftContent: {
      type: Schema.Types.Mixed,
      default: () => ({ widgets: [] }),
    },
    publishedContent: {
      type: Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: ["draft", "saved", "published"],
      default: "draft",
      index: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    publishedVersion: {
      type: Number,
      default: 0,
    },
    lastSavedAt: {
      type: Date,
      default: Date.now,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comments"
      }
    ],

    author: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
)

builderTemplateSchema.index({ author: 1, updatedAt: -1 })

module.exports = model("BuilderTemplate", builderTemplateSchema)
