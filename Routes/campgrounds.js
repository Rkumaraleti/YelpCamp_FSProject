const express = require('express');
const router = express.Router();

// Cloud Storage [cloudinary]:
const {storage} = require('../cloudinary')

// Image upload handlilng middleware (NPM Pack)
const multer  = require('multer')
const upload = multer({ storage }) //<- Destination to Store image file!

// Controllers:
const campgrounds = require('../controllers/campgrounds')

// Error Handling:
const CatchAsync = require('../utilities/CatchAsync') /* This function will catch the error if any and calls next which is all the last app.use() middleware after routes */

// Middleware.js for Login session validation:
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware')


// Routes /campgrounds/route...

// router.route helps to group routes!

router.route('/')
    .get(CatchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, CatchAsync(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);
    
router.route('/:id')
    .get(CatchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'),validateCampground, CatchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, CatchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor,CatchAsync(campgrounds.renderEditForm));

module.exports = router; //To export all the routes!