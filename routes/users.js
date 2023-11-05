const express = require('express');
const router = express.Router();
/* import the correct controller here */
const usersController = require('../controllers/users_controller');
const passport = require('passport');

// if the user is authenticated then only we can access the route /users/profile
router.get('/profile/:id', passport.checkAuthentication, usersController.profile);

router.post('/update/:id', passport.checkAuthentication, usersController.update);

router.get('/sign-up', usersController.signUp);
router.get('/sign-in', usersController.signIn);

/* from form data is sent to /users/create => so for that route : call the action to create a user && this route doesn't gets you anything : it just POST data to the server*/
router.post('/create', usersController.create);

//create session > passport handles it
//use passport as a middleware to authenticate
router.post('/create-session', passport.authenticate(
    'local', //strategy
    {failureRedirect: '/users/sign-in'}//in case of can't autheticate : redirect here
), usersController.createSession);

router.post('/sign-out', usersController.destroySession);

module.exports = router;