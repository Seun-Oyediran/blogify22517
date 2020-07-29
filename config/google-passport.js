const Blogger = require('../models/user')
const GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function (passport) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        // console.log(profile);
        let newblogger = new Blogger({
            name: profile.displayName,
            google_id: profile.id,
            image: profile.photos[0].value
        })
        // console.log(blogger);

        try {
            let blogger = await Blogger.findOne({ google_id: profile.id })
            if (blogger) {
                return done(null, blogger)
            }
            else {
                try {
                    let blogger = newblogger.save()
                    return done(null, blogger)
                } catch (error) {
                    console.log(error);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    ))
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        Blogger.findById(id, function (err, user) {
            done(err, user);
        });
    });
}

// "http://localhost:3000/auth/google/callback"