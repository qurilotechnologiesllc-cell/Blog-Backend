const { Schema, model } = require("mongoose");

const SeoSchema = new Schema(
    {
        // ===== BASIC SEO =====
        metaTitle: {
            type: String,
            trim: true,
            maxlength: [60, "Meta title 60 characters se zyada nahi hona chahiye"],
        },

        urlSlug: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
        },

        domain: {
            type: String,
            trim: true,
            lowercase: true
        },

        metaDescription: {
            type: String,
            trim: true,
            maxlength: [160, "Meta description 160 characters se zyada nahi hona chahiye"],
        },

        focusKeyword: {
            type: String,
            trim: true,
        },

        additionalKeywords: [
            {
                type: String,
                trim: true,
            },
        ],

        canonicalUrl: {
            type: String,
            trim: true,
        },

        author: {
            type: String,
            trim: true,
        },

        publishDate: {
            type: Date,
            default: Date.now,
        },

        robotsMetaTag: {
            type: String,
            enum: [
                "index, follow",
                "noindex, follow",
                "index, nofollow",
                "noindex, nofollow",
            ],
            default: "index, follow",
        },

        seoScore: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // ===== FACEBOOK / OPEN GRAPH =====
        openGraph: {
            ogTitle: {
                type: String,
                trim: true,
                // blank rehne pe metaTitle use hoga frontend pe
            },
            ogDescription: {
                type: String,
                trim: true,
                // blank rehne pe metaDescription use hoga frontend pe
            },
            ogImageUrl: {
                type: String,
                trim: true,
                // Recommended: 1200x630px (image mein likha hai)
            },
        },

        // ===== TWITTER CARD =====
        twitterCard: {
            twitterTitle: {
                type: String,
                trim: true,
                // blank rehne pe ogTitle use hoga frontend pe
            },
            twitterDescription: {
                type: String,
                trim: true,
                // blank rehne pe ogDescription use hoga frontend pe
            },
            twitterImageUrl: {
                type: String,
                trim: true,
                // blank rehne pe ogImageUrl use hoga frontend pe
            },
        },

        // Post ke saath link
        post: {
            type: Schema.Types.ObjectId,
            ref: "BuilderTemplate",
        },
    },
    {
        timestamps: true,
    }
);

const SEO = model("SEO", SeoSchema);

module.exports = SEO;