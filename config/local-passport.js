const LocalStrategy = require('passport-local').Strategy
const bcrypt = require("bcryptjs");
const Blogger = require('../models/user')

module.exports = function (passport) {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
        try {
            let blogger = await Blogger.findOne({ email: email })
            if (!blogger) {
                return done(null, false, { message: 'Email is not registered' })
            }

            try {
                let match = await bcrypt.compare(password, blogger.password)
                if (match) {
                    return done(null, blogger)
                } else {
                    return done(null, false, { message: 'Password does not match' })
                }
            } catch (error) {
                console.log(error);
            }

        } catch (error) {
            console.log(error);
        }
    }))
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        Blogger.findById(id).then((user) => {
            done(null, user);
        });
    });
}