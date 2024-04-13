const express = require('express');
const router = express.Router();
const catchAsync = require('../utilities/CatchAsync');
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');

// Controllers:
const users = require('../controllers/users');

// router.route <- to group routes and separate by mode of request(get or post...)
router.route('/register')
    .get(users.renderRegister)
    .post(catchAsync(users.register));

// Login Routes
router.route('/login')
    .get(users.renderLogin)
    .post(storeReturnTo,passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

router.get('/logout', users.logout)

module.exports = router;