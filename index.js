// When App runs in Development dotenv is used! Else it wont!
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

// All Packages from NPM:
const express = require('express');
const mongoose = require('mongoose');
const ejs = require('ejs');
const ejsMate = require('ejs-mate') // EJS Lib to layout things
const path = require('path');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const helmet = require('helmet');
const MongoDBStore = require('connect-mongo');


// To Avoid Mongo Injection:
const mongoSanitize = require('express-mongo-sanitize');

// Passport:
const passport = require('passport'); // Passport: Login and Password library
const LocalStrategy = require('passport-local') // Local Strategy: Passport Login Strategies!

// Routes:
const usersRoutes = require('./Routes/users.js');
const campgroundsRoutes = require('./Routes/campgrounds.js');
const reviewsRoutes = require('./Routes/reviews.js')

// Error Handling:
const ExpressError = require('./utilities/expressError')

// DataBase link:
const dbURL = process.env.DB_URL;

// Configuring:
const store = MongoDBStore.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: "thisshouldbeabettersecret"
    }
})

store.on('error', function (e) {
    console.log("session store error!",e);
})

// Defined Models:
const User = require('./models/user')

// App to Express Obj:
const app = express();

// Using EjsMate Engine as Default Engine:
app.engine('ejs', ejsMate);

// Setting some defaults to express: 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));
//Static Files:
app.use(express.static(path.join(__dirname,'public')));

// Express Additional usage features!!!
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Using Mongo-sanitize as middleware:
app.use(mongoSanitize());

// Allowed sources to fetch files and protect from Helmet:
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net"
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dfmsjjirh/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Listening PORT:
const PORT = 8000;

// Establishing Session:
const sessionConfig = {
    store,
    name: 'session',//<- To change session name
    secret: 'thishouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxage: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig)); //<- Session as a Middleware
app.use(flash()) //<- Flash as a Middleware

// Passport -> Login and User Authentication:
app.use(passport.initialize()); // <- Passport as a Middleware
app.use(passport.session()); //<- For persitant Login Sessions 
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash & Local{Global} Variables: 
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

//DataBase Connection:
// 'mongodb://localhost:27017/yelp-camp'
mongoose.connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Connection:
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error!"));
db.once("open", () => {
    console.log('Database is Connected!!!');
})

// Routes:
app.get('/', (req, res) => {
    res.render('home', {id: 12345});
});

app.use('/', usersRoutes);

app.use('/campgrounds', campgroundsRoutes);

app.use('/campgrounds/:id/reviews', reviewsRoutes);


// If Routes failed:
app.all("*", (req, res, next) => {
    next(new ExpressError('Oh! Here we got an error', 404));
})

// Error Handling Middleware will be executed if not above route is called:
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err) {
        err.message = "Something went wrong!";
    }
    res.status(statusCode).render('error', {err});
})

app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
})