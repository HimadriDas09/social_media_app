const Post = require('../models/post');
const User = require('../models/user');

module.exports.home = async function(req, res){
    // return res.end('<h1>Express is up a for Codeial!</h1>');

    // console.log(req.cookies); /* req.cookies to access all cookies */
    // res.cookie('user_id', 25); /* req.cookie to change particular cookie */

    //display all the posts by diff users > using Post.find({}).populate('user') we're finding all documents in Post collection && then populating the user field with the Object to which it is ref (rather than just Object Ids) > using .exec() executing the entire query written before it
    try {
        let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            options: {sort: {createdAt: -1}},
            populate: {
                path: 'user'
            }
        });
        // post > user : object , comments : [objects] > now within each comment obj > populate the user ==> now we can display the (content,user) of every comment since now we have access to them
        
        // we also want to display all the users in the home page
        let users = await User.find({});
    
        /* return all the posts, users as JSON to home_posts.js */
        if(req.xhr) {
            return res.status(200).json({
                data: {
                    posts: posts,
                    all_users: users
                },
                message: "all posts displayed successfully! (AJAX)"
            })
        }
        else {
            // from controller we send all the posts to view : home.ejs
            return res.render('home', {
                title : "Codeial | Home",
                posts : posts,
                all_users : users
            });
        }
    
        //since app.set('views', './views') => so 'home' targets '../views/home.ejs' and we pass an object with key and values
    }
    catch(err) {
        console.log('Error', err);
        return;
    }
}