const express = require('express');
const router = express.Router({mergeParams: true});// To include parameters of route we must give mergeparams to true!!

// Controller:
const reviews = require('../controllers/reviews.js')

// Error Handling:
const CatchAsync = require('../utilities/CatchAsync') /* This function will catch the error if any and call next which is all the last app.use() middleware after routes */

// User is Logged in Middleware:
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware.js");

//Routes:
router.post('/', isLoggedIn, validateReview, CatchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, CatchAsync(reviews.deleteReview));

module.exports = router;