const passport = require('passport');

/* LocalStrategy allows u to define how your application should verify user credentials against a localDB */
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

//we need to tell passport to use this LocalStrategy that we've created
//authentication using passport
passport.use(new LocalStrategy({
     //how do I uniquely identify each user
        usernameField : 'email',
        passReqToCallback: true
    },
    //when localStrategy is called, the email, password, done fn is called
    function(req, email, password, done) { //done fn inbuild to passport takes 2 args
        //find a user and establish the identity
        User.findOne({email : email})
        .then((user) => {
            if(!user || user.password != password) {
                req.flash('error', 'Invalid Username/Password');
                return done(null, false); /* 2 args > 0th = if there is an err, 1th = if authentication is done(& not done since something invalid) */
            }
            //user found > so server returns u the user obj, now in serialization fn decide which key to be used for auth.
            return done(null, user);
        })
        .catch((err) => {
            req.flash('error', err);
            return done(err); //this will report an error to passport
        })
    }
));

//serializing the user to decide which key is to be kept in the cookies(and this key is only encrypted) > then cookie is automatically sent to the browser
passport.serializeUser(function(user, done){
    done(null, user.id);
})

//deserializing the user from the key in the cookies
//when a user comes in : we need to deserialize that which user is this && store the user in req.user to make it available throughout the lifecycle.
passport.deserializeUser(function(id, done) {
    User.findById(id)
    .then((user) => {
        return done(null, user);
    })
    .catch((err) => {
        console.log('error in finding user --> passport');
        return done(err);
    })

})

// below > just a middleware to check if the user is signed in or not
// check if user is authenticated 
passport.checkAuthentication = function(req, res, next) {
    // if the user is signed in, then pass the request to the next function(controller's action) > req.isAuthenticated() is T if user is signed in else false
    if(req.isAuthenticated()) {
        return next();
    }

    //if user is not signed in
    return res.redirect('/users/sign-in');
}

passport.setAuthenticatedUser = function(req, res, next) {
    if(req.isAuthenticated()) {
        // req.user contains the current signed in user from the session cookie and we're just sending this to the locals for the views
        res.locals.user = req.user;
    }
    next();
}

module.exports = passport;