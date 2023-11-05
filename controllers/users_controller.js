/* import the model here => to access db or make changes in it */
// const { userInfo } = require('os');
const User = require('../models/user');
const fs = require('fs');
const path = require('path');

// since no nesting of callbacks OR nested promise handling : so no need to async await

//userController.profile => contains below action
module.exports.profile = function(req, res){
    // bcz we're sending id of the user as query parameters
    User.findById(req.params.id)
    .then((user) => { 
        return res.render('user_profile', {
            title : "Home",
            profile_user : user // to whichever user's profile we want to go to
        });
    })
    .catch((err) => {console.log('error in finding user using id for profile page');})
}

module.exports.update = async function(req, res) {
    // check : if profile to update belongs to cur logged in user
    if(req.user.id == req.params.id) {
        // update the id
        /* User.findByIdAndUpdate( which document to update, object contains fields you
        want to change and their new values ) */
        try {
            let user = await User.findById(req.params.id);
            User.uploadedAvatar(req, res, function(err) {
                // error handling in multer
                if(err || err instanceof multer.MulterError) {
                    return res.flash('error', err);
                }

                // console.log(req.file);
                user.name = req.body.name; /* body-parser cannot parse multipart form data, but multer can > that's why we can access req.body.name */
                user.email = req.body.email;

                // user may not upload a file
                if(req.file) {
                    
                    // console.log(req.file);
                    if(req.file.mimetype == 'image/png' || req.file.mimetype == 'image/jpg') {
                        // check if uploaded file is an image > then only update the path
                        console.log('selected file is an image');

                        // delete prev user avatar > if present
                        if(user.avatar) {
                            // i.e in db > it's not null > i.e prev been updated > it contain the path to it 
                            // but also check > if it's physically present or not else how will u delete it
                            let delete_file_path = path.join(__dirname, '..', user.avatar);

                            if(fs.existsSync(delete_file_path)) {
                                // to delete it
                                // if not present > then attempting to delete it causes error
                                fs.unlinkSync(delete_file_path);    
                            }
                        }

                        // this is saving the path of the uploaded file into the avatar field of the user document > i.e updating the user document
                        user.avatar = User.avatarPath + '/' + req.file.filename; 
                    }
                    // else {
                    //     // file not an image
                    //     req.flash('error', 'selected file not uploaded, file should be png/jpg!');
                    //     return res.redirect('back');
                    // }

                }
                    
                user.save();

                req.flash('success', 'changes has been successfully updated');
                return res.redirect('back');
            })
        }catch(err) {
            req.flash('error', err);
            return res.redirect('back');
        }
    }
    else {
        req.flash('error', 'Unauthorized User!');
        // http status code for unauthorized is 401
        return res.status(401).send('Unauthorized');
    }
}

//render the sign up page
module.exports.signUp = function(req, res) {
    //user is already signed in > redirect to profile page
    if(req.isAuthenticated()) {
        return res.redirect('/users/profile');
    }
    return res.render('user_sign_up', {
        title : "Codeial | Sign Up"
    })
}

//render the sign in page
module.exports.signIn = function(req, res) {
    //user is already signed in > redirect to profile page
    if(req.isAuthenticated()) {
        return res.redirect('/users/profile');
    }
    return res.render('user_sign_in', {
        title : "Codeial | Sign In"
    })
}

//get the sign up data
module.exports.create = function(req, res) {
    //if password and confirm_password are different then redirect back
    if(req.body.password != req.body.confirm_password) {
        req.flash('warning', 'password and confirm password cannot be different!');
        return res.redirect('back');
    }

    //so if that email id already exists then we do not create a user else we do
    //User.findOne() now returns a promsise
    User.findOne({email : req.body.email})
    .then((user) => {
        if(!user) {
            //User.create() also returns a promise now
            User.create(req.body)
            .then((user) => {
                req.flash('success', 'New User Created!');
                return res.redirect('/users/sign-in');
            })
            .catch((err) => {
                console.log('error in creating user while signing up'); 
                req.flash('warning', err);
                return res.redirect('back');
            })            
        }
        else {
            req.flash('warning', 'This user already exists, kindly sign in');
            return res.redirect('back'); /* if user is already present then redirect to sign-up page : bcz user was in sign-up page */
        }
    })
    .catch((err) => {
        req.flash('error', 'Could not create user'); 
        return;
    })
}

//sign in and create a session for the user
module.exports.createSession = function(req, res) {
    req.flash('success', req.user.name + ' Logged in Successfully');
    //no need to create a session bcz session is already created by passport itself
    return res.redirect('/');//after authentication against the 'local' strategy in the routes, we're redirected to the home page
}

module.exports.destroySession = function(req, res) {
    req.logout(function(err) {
        if(err) console.log(err + 'in loggin out');
    }); //passport provides this : for session removal & serialized user removal
    
    req.flash('success', 'You have logged out');
    return res.redirect('back'); 
}