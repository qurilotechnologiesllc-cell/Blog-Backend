const SEO = require("../models/Seo.models")

const generateSeoforPost = async (req, res) => {
    try {
        const {
            // Basic SEO
            metaTitle,
            urlSlug,
            domain,
            metaDescription,
            focusKeyword,
            additionalKeywords,
            canonicalUrl,
            author,
            publishDate,
            robotsMetaTag,
            seoScore,

            // Open Graph
            openGraph,

            // Twitter Card
            twitterCard,

            // Post Reference
            post,
        } = req.body

        const seo = await SEO.create({
            metaTitle,
            urlSlug,
            domain,
            metaDescription,
            focusKeyword,
            additionalKeywords,
            canonicalUrl,
            author,
            publishDate,
            robotsMetaTag,
            seoScore,
            openGraph,
            twitterCard,
            post,
        })

        res.status(201).json({
            success: true,
            message: "SEO data saved successfully!",
            data: seo,
        })

    } catch (error) {
        // Duplicate urlSlug error handle karo
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: "Yeh URL Slug pehle se exist karta hai, koi aur slug use karo!",
            })
        }

        res.status(500).json({
            success: false,
            message: "SEO save karne mein error aaya!",
            error: error.message,
        })
    }
}

const previewSeoPost = async (req, res) => {
    try {
        const { id } = req.params        
   
        const seo = await SEO.findById(id).populate("post")

        if (!seo) {
            return res.status(404).json({
                success: false,
                message: "Not Found",
            })
        }

        // Fallback logic — blank hone pe parent value use karo
        const preview = {
            // Basic SEO
            metaTitle: seo.metaTitle,
            urlSlug: seo.urlSlug,
            domain: seo.domain,
            metaDescription: seo.metaDescription,
            focusKeyword: seo.focusKeyword,
            additionalKeywords: seo.additionalKeywords,
            canonicalUrl: seo.canonicalUrl,
            author: seo.author,
            publishDate: seo.publishDate,
            robotsMetaTag: seo.robotsMetaTag,
            seoScore: seo.seoScore,

            // Facebook / Open Graph Preview
            openGraph: {
                ogTitle: seo.openGraph?.ogTitle || seo.metaTitle,
                ogDescription: seo.openGraph?.ogDescription || seo.metaDescription,
                ogImageUrl: seo.openGraph?.ogImageUrl || null,
            },

            // Twitter Card Preview
            twitterCard: {
                twitterTitle: seo.twitterCard?.twitterTitle || seo.openGraph?.ogTitle || seo.metaTitle,
                twitterDescription: seo.twitterCard?.twitterDescription || seo.openGraph?.ogDescription || seo.metaDescription,
                twitterImageUrl: seo.twitterCard?.twitterImageUrl || seo.openGraph?.ogImageUrl || null,
            },

            // Linked Post Details
            post: seo.post,
        }

        res.status(200).json({
            success: true,
            message: "SEO preview successfully fetched!",
            data: {
                ...preview,
                generatedCode: generateMetaTagsCode(preview) // ← Yeh add karo
            }
        })

    } catch (error) {
        // Invalid MongoDB ID handle karo
        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Invalid SEO ID format!",
            })
        }

        res.status(500).json({
            success: false,
            message: "SEO Server Error",
            error: error.message,
        })
    }
}

// previewSeoPost controller mein ek aur field add karo
const generateMetaTagsCode = (preview) => {
    return `{/* Basic SEO */}
<title>${preview.metaTitle}</title>
<meta name="description" content="${preview.metaDescription}" />
<meta name="keywords" content="${preview.additionalKeywords?.join(", ")}" />
<meta name="author" content="${preview.author}" />
<meta name="robots" content="${preview.robotsMetaTag}" />

{/* Open Graph / Facebook */}
<meta property="og:type" content="article" />
<meta property="og:title" content="${preview.openGraph.ogTitle}" />
<meta property="og:description" content="${preview.openGraph.ogDescription}" />
<meta property="og:image" content="${preview.openGraph.ogImageUrl}" />
<meta property="og:url" content="${preview.canonicalUrl}" />
<meta property="article:published_time" content="${preview.publishDate}" />
<meta property="article:author" content="${preview.author}" />

{/* Twitter Card */}
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${preview.twitterCard.twitterTitle}" />
<meta name="twitter:description" content="${preview.twitterCard.twitterDescription}" />
<meta name="twitter:image" content="${preview.twitterCard.twitterImageUrl}" />`
}

module.exports = { generateSeoforPost, previewSeoPost }