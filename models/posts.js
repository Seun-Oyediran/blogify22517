const mongoose = require('mongoose')


const PostSchema = new mongoose.Schema({
    title: {
        type: String, required: true
    },
    status: {
        type: String, required: true
    },
    body: {
        type: String, required: true
    },
    blogger: { type: mongoose.Schema.Types.ObjectId, ref: 'Blogger' },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Post', PostSchema)