const { Schema, model } = require('mongoose')

const commentsSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'userId is required'],
        },
        blogId: {
            type: Schema.Types.ObjectId,
            ref: 'Blog',
            required: [true, 'blogId is required'],
        },
        name: {
            type: String,
            required: [true, 'name is required'],
            trim: true,
            maxlength: 100,
        },
        text: {
            type: String,
            required: [true, 'Comment text is required'],
            trim: true,
            maxlength: 1000,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // createdAt + updatedAt
    }
)

const Comments = model('Comments', commentsSchema)

module.exports = Comments