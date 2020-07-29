const mongoose = require('mongoose')


const BloggerSchema = new mongoose.Schema({
    name: {
        type: String, required: true
    },
    google_id: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String
    },
    image: { type: String, default: 'css&Img/avatar-1577909_1280.png' },
    createdAt: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Blogger', BloggerSchema)