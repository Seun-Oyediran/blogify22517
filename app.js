const express = require('express')
const app = express()
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
require('dotenv').config()
const passport = require('passport')
const flash = require('connect-flash')
const session = require('express-session')

const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')
const methodOverride = require('method-override')

require('./config/google-passport')(passport)
require('./config/local-passport')(passport)


mongoose.connect(process.env.mongoos, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log(`DB connected...`);
    })


app.use(methodOverride('_method'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

app.use(passport.initialize());
app.use(passport.session());

app.use(flash())

app.use((req, res, done) => {
    res.locals.successMsg = req.flash("successMsg");
    res.locals.errorMsg = req.flash("errorMsg");
    res.locals.error = req.flash("error");
    done();
});



app.use(expressLayouts)
app.set('view engine', 'ejs')



app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/routes'))
app.use('/posts', require('./routes/post'))



app.listen(process.env.PORT, () => {
    console.log(`Server running on PORT ${process.env.PORT}`);
})