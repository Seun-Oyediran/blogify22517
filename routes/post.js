const express = require('express')
const router = express.Router()
const passport = require('passport')
const Blogger = require('../models/user')
const Post = require('../models/posts')
const { route } = require('./routes')
const { ensureAuth, ensureGuest } = require('../config/auth')
let limit = 20
router.get('/', ensureAuth, async (req, res) => {
    let link = '/posts'
    let title = 'Public Posts'
    let user = req.user
    let page = 1
    if (typeof req.query.page == 'undefined') {
        page = 1
    } else {
        page = +req.query.page
    }
    let post = await Post.find({ status: 'Public' }).sort({ createdAt: -1 }).populate('blogger')
    let length = post.length
    let start = (page - 1) * limit
    let end = (page) * limit
    let posts = post.slice(start, end)
    // console.log(page);
    res.render('posts', { title, posts, user, page, start, end, length, link })
})

router.post('/', ensureAuth, async (req, res) => {

    let newpost = new Post({
        title: req.body.title,
        status: req.body.status,
        body: req.body.body,
        blogger: req.user.id
    })
    await newpost.save()
    req.flash('successMsg', 'Post created successfully')
    res.redirect('/home')
})

router.get('/:id', ensureAuth, async (req, res) => {
    let user = req.user
    let posts = await Post.findById(req.params.id).populate('blogger')
    let title = 'Read Post'
    res.render('onepost', { posts, title, user })
})

router.delete('/:id', ensureAuth, async (req, res) => {
    let post = await Post.findById(req.params.id)
    if (req.user.id != post.blogger) {
        req.flash('errorMsg', 'You cannot perform this action')
        res.redirect('/home')
    } else {
        await post.delete()
        req.flash('successMsg', 'Deleted Successfully')
        res.redirect('/home')
    }

})

router.put('/:id', ensureAuth, async (req, res) => {

    let post = await Post.findById(req.params.id)
    if (req.user.id != post.blogger) {
        req.flash('errorMsg', 'You cannot perform this action')
        res.redirect('/home')
    } else {
        await post.updateOne(req.body, { new: true, runValidators: true })
        req.flash('successMsg', 'Updated Successfully')
        res.redirect('/home')
    }

})





module.exports = router