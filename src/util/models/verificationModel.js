const mongoose = require('mongoose')

const verificationSchema = mongoose.Schema({
    userId: {
        required: true,
        type: String,
    },
    awaitingVerification: {
        type: Array
    },
    username: {
        type: String
    }
})
module.exports = {
    name: "verification",
    Model: mongoose.model('verification', verificationSchema)
}