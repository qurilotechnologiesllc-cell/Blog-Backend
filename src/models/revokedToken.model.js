const { Schema, model } = require('mongoose')

const revokedTokenSchema = new Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    revokedAt: {
        type: Date,
        default: Date.now
    }
})

const RevokedToken = model('RevokedToken', revokedTokenSchema)

module.exports = RevokedToken