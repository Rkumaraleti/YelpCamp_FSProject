const Campground = require('./models/campground');
const Review = require('./models/review');

// defined Joi schema: 
const { campgroundSchema, reviewSchema } = require('./schemas')

// ErrorHandling
const ExpressError = require('./utilities/expressError')


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.requestTo = req.originalUrl;
        req.flash('error', 'You must be signed in First!');
        return res.redirect('/login'); // <- Return to break the block here itself!!!
    }
    next();
}

module.exports.storeReturnTo = (req, res, next) => { // <- Passport.js will restart the session after login so storing the path as local variable!
    if (req.session.requestTo) {
        res.locals.returnTo = req.session.requestTo;
    }
    next();
}

// Joi Server Side validator function: 

    // -> Validating Campground
module.exports.validateCampground = (req, res, next) => {
    // Joi vaidator validates the schema values and returns the error with message {Server side validation!!!}
    
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 404)
    }
    else {
        next();
    }
}

// Middleware for Author Authorisation:
module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You\'re not Permitted to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Middleware for Author Authorisation:
module.exports.isReviewAuthor = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(id);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You\'re not Permitted to do that!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}

// Joi Server Side validator function: 

// -> Validating Review
module.exports.validateReview = (req, res, next) => {
    // Joi vaidator validates the schema values and returns the error with message {Server side validation!!!}
    
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 404)
    }
    else {
        next();
    }
}
 

