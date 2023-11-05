const express = require('express');
const router = express.Router(); // fn returns a router object
const passport = require('passport');

const postsController = require('../controllers/posts_controller');

/* keeping a check > user without beign authenticated i.e without beign signed in
cannot create a post */
router.post('/create', passport.checkAuthentication, postsController.create);
router.get('/destroy/:id', passport.checkAuthentication, postsController.destroy);

module.exports = router;