const Post = require('../models/post');
const Comment = require('../models/comment');
//controller is a module of actions 

module.exports.create = async function(req, res) {
    /* NOTE : since creating a post is in homepage && any user(not signed in) can also create a post > so we need to restrict that */
    try {
        let post = await Post.create({ 
            content : req.body.content,
            user : req.user.id 
        })

        post = await post.populate('user'); /* findById might take time, so we await > i.e when it returns post > then only we populate the user */
        // OR > post = await post.populate('user')

        // send JSON data to client(bcz of the req being AJAX)
        /* how to send JSON data ? > with a status code */
        /* generally when we send JSON, we also sent a message in JSON */
        if(req.xhr) {
            return res.status(200).json({
                data: {
                    post: post
                },
                message: "Post Created! (AJAX)"
            });
        }

        req.flash('success', 'New Post Created!');
        return res.redirect('back');

    } catch(err) {
        if(req.xhr) {
            return res.status(500).json({
                message: 'Unable to create post (AJAX)'
            })
        }
        req.flash('error', 'Could not create post');
        console.log('Error', err);
    }   
}

// deleting a post : getting post_id via req params
module.exports.destroy = async function(req, res) {
    try {
        // check if the post_id is even valid or not
        let post = await Post.findById(req.params.id) // id is the variable name in params in route
        // I can only delete the post that I've made
        // req.user contains the current logged in user && .id converts the user id to string
        if(post.user == req.user.id) {
            // post deleted : user contains an ObjectId not a string so put req.user._id to query
            await Post.findByIdAndDelete(req.params.id)

            // now query comments based on post id and delete them
            await Comment.deleteMany({post: req.params.id})

            // if req is an xhr request(i.e for AJAX), in JSON return the post id
            if(req.xhr) {
                return res.status(200).json({
                    data: {
                        post_id: req.params.id
                    },
                    message: "Post and associated comment deleted (AJAX)"
                })
            }
            
            // if req is xhr > control doesn't reach below
            req.flash('success', 'Post and associated comments deleted');
            return res.redirect('back');
        } 
        else {
            // send post_id == null 
            // when this is not valid user to delete this post
            if(req.xhr) {
                return res.status(401).json({
                    data: {
                        post_id: null
                    },
                    message: 'UnAuthorized User (AJAX)!'
                })
            }

            req.flash('warning', 'you are not valid user to delete this post');
            return res.redirect('back');
        }
    } catch(err) {
        if(req.xhr) {
            // 500 : internal server error
            return res.status(500).json({
                message: 'Could not delete post and associated comments (AJAX)'
            })
        }

        req.flash('error', 'Could not delete post and associated comments');
        return res.redirect('back');
    }
}