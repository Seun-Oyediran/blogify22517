const express = require('express')
const router = express.Router()
const passport = require('passport')
const Blogger = require('../models/user')
const Post = require('../models/posts')
const bcrypt = require('bcryptjs')
const { ensureAuth, ensureGuest } = require('../config/auth')
let limit = 20
let title = ''
router.get('/', ensureGuest, (req, res) => {

    let title = 'Log In'
    res.render('login', { title })
})
router.get('/signup', ensureGuest, (req, res) => {

    let title = 'Sign Up'
    res.render('signup', { title })
})

router.post('/signup', async (req, res) => {
    let title = 'Sign Up'
    let err = []
    let data = req.body
    if (req.body.password != req.body.password2) {
        err.push('Password does not match')
    }
    if (req.body.password.length < 6) {
        err.push("Password must be at least 6 characters");
    }
    if (err.length > 0) {
        res.render('signup', { err, data, title })
    } else {
        try {
            let oneblogger = await Blogger.findOne({ email: req.body.email })
            if (oneblogger) {
                err.push('Email already exists')
                res.render('signup', { err, data, title })
            } else {
                try {
                    let hashedPassword = await bcrypt.hash(data.password, 10)
                    const blogger = new Blogger({
                        name: data.name,
                        email: data.email,
                        password: hashedPassword
                    })
                    // console.log(blogger);
                    await blogger.save()
                    req.flash("successMsg", "You are now registered and can log in");
                    res.redirect('/')
                } catch (error) {

                }
            }
        } catch (error) {
            console.log(error);
        }
    }
})

router.get('/newpost', ensureAuth, (req, res) => {
    // console.log(req.user)
    let title = 'Create Post'
    res.render('newpost', { title })
})




router.post("/login", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/",
        failureFlash: true,
    })(req, res, next);
});





router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/home');
    });

router.get('/home', ensureAuth, async (req, res) => {
    let user = req.user
    let link = '/home'
    let page = 1
    if (typeof req.query.page == 'undefined') {
        page = 1
    } else {
        page = +req.query.page
    }
    let post = await Post.find({ blogger: req.user.id }).populate('blogger').sort({ createdAt: 1 })
    let title = 'Home'
    let length = post.length
    let start = (page - 1) * limit
    let end = (page) * limit
    let posts = post.slice(start, end)
    res.render('home', { title, posts, page, start, end, length, link, user })
})


router.get('/edit/:id', ensureAuth, async (req, res) => {
    let title = 'Edit'
    let posts = await Post.findById(req.params.id)
    res.render('editone', { title, posts })
})


router.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
})



router.get('/blogger/:id', ensureAuth, async (req, res) => {
    let link = `/blogger/${req.params.id}`
    let title = 'Blogger'
    let user = req.user
    let page = 1
    if (typeof req.query.page == 'undefined') {
        page = 1
    } else {
        page = +req.query.page
    }
    let post = await Post.find({ blogger: req.params.id, status: 'Public' }).sort({ createdAt: 1 }).populate('blogger')

    let length = post.length
    let start = (page - 1) * limit
    let end = (page) * limit
    let posts = post.slice(start, end)
    res.render('blogger', { title, posts, user, page, start, end, length, link })
})





module.exports = router