// surrounding with {} just for scope
{
    /* 
    WHY DO IT ? 
    > bcz posts is accessible to views only > then how can I access every post here.
    > get all posts via AJAX: then attach the onclick deletePost handler to X of each post: to delete every post via AJAX */

    /* DO THIS AT THE BEGINNING: want to create every NEW post using AJAX: attach submit handler to post-form stop the default http submission. What about all the OLD posts: for(post of posts(from / route)) {
        - attach click handler to delete-post to delete post using AJAX only
        - attach submit handler to comment-form of each post to submit using AJAX only
        - also for a post: for(comment of post.comment) {
            - attach click handler to delete-comment to delete via AJAX only
        }
    }
    ALSO sort posts and comments in a post in inc order of createdAt  */
    $.ajax({
        type: 'get',
        url: '/',
        success: function(data) {
            let posts = data.data.posts;
                
            // all posts to be deleted using AJAX:
            // attach the click handler in deletePost(deleteLink i.e <a> delete button of each post) to delete button of all posts
            for(let post of posts) {
                let postElem = $(`#post-${post._id}`);
                deletePost($(' .delete-post-button', postElem));

                // attach submit handler to comment-form of each post
                createComment(postElem);

                // attach click handler on delete-comment of each comment
                for(let comment of post.comments) {
                    let commentElem = $(`#comment-${comment._id}`);
                    deleteComment($(' .delete-comment-button', commentElem));
                }
            }
            // displayNotification("success", data.message);
        },
        error: function(err) {
            displayNotification("error", err.responseText);
        }
    })


    // method to submit the form data for new post using AJAX
    let createPost = function() {
        let newPostForm = $('#new-posts-form');

        newPostForm.submit(function(e) {
            e.preventDefault(); /* to not submit the form directly to the sever
            but rather submit using AJAX */

            $.ajax({
                type: 'post',
                url: '/posts/create',
                data: newPostForm.serialize(), // data sent as request body to the server in the form of url-encoded string
                success: function(data) {
                    /* after form submission to the server via the api, server returns requested response */
                    let newPost = newPostDom(data.data.post);
                    // now prepend it to the list 
                    $('#posts-list-container > ul').prepend(newPost);

                    // call deletePost(newly created Post) > attaches a handler to this elem > when clicked > deletion using AJAX is done.
                    deletePost($(' .delete-post-button', newPost)); // under newPost AJAX Obj fetch the obj whose class is .delete-post-button

                    displayNotification("success", data.message);
                },
                error: function(err) {
                    console.log(err.responseText); 
                    displayNotification("error", err.responseText);
                }
            })
        })
    }

    // method to create a post in DOM
    let newPostDom = function(post) {
        // post contain newly created post obj from the server
        // only return a part of the webpage in AJAX
        /* since we're adding to the DOM, so some stuffs might not be required to be
        added to the elem> so edit */
        
        return $(`<li class="post" id="post-${post._id}">
                    <p>
                        <small>
                            <a class="delete-post-button" href="/posts/destroy/${post._id}"><i class="fa-solid fa-trash" style="color: #ff2424;"></i></a>
                        </small>
                        
                        
                        <strong style="font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif; font-size: medium;">${post.content}</strong>
                        <br>
                        <small>
                            ${post.user.name}
                        </small>
                        <div id="post-comments"> 
                            <form action="/comments/create" method="POST" id="comment-form">
                                <input type="text" name="content" placeholder="Type here to add comments..." required autocomplete="off">
                                <input type="hidden" name="post" value="${post._id}">
                                <br>
                                <input type="submit" value="Add comment">
                            </form>
                
                            <div class="post-comments-list">
                                <ul id="post-comments-${post._id}">

                                </ul>
                            </div>
                        </div>
                    </p>
                </li>`)
    }


    // method to delete post from DOM

    /* deleteLink is the <a> tag on which we're clicking to delete the post, whose href = /posts/destroy/<%= post.id %> 
    => to pass this AJAX obj using jquery to the deletePost fn 
    syntax: $(' .class_name', Obj) => within Obj get the obj with className = 'class_name'
    */
    let deletePost = function(deleteLink) {
        console.log(`click handler to delete added to ${deleteLink}`);
        // deleteLink is the elem on which we're clicking
        $(deleteLink).click(function(e) {
            e.preventDefault(); // normal http req won't be sent to the server
            // rather an xhr req will be sent

            $.ajax({
                type: 'get',
                url: $(deleteLink).prop('href'),
                success: function(data) {
                    if(data.data.post_id != null) {
                        /* suppose: in server: elem is deleted from db and post obj of the elem is returned > so that this elem could be removed from DOM */
                        // now delete this elem(elem with id: post-<%= post.id%>) from DOM
                        $(`#post-${data.data.post_id}`).remove();
                        displayNotification("success", data.message);
                    }
                    else {
                        displayNotification("warning", data.message);
                    }
                },
                error: function(err) {
                    console.log(err.responseText);
                    displayNotification("error", err.responseText);
                }
            })
        })
    }

/********************COMMENTS SECTION**************************************** */

    // method to send in comment data via AJAX and create comment
    let createComment = function(post) {
        // post is the post jquery object 
        /* attach a submit handler to comment submission form, stop default behavior, submit using AJAX */
        /* NOTE,IMP: BUT which comment Submission form ? > so for each post's #comment-form > call this createComment function */
        let newCommentForm = $(' #comment-form', post);
        newCommentForm.submit(function(e) {
            e.preventDefault();

            $.ajax({
                type: 'post',
                url: '/comments/create',
                data: newCommentForm.serialize(), /* convert the form data(url encoded string) into JSON */
                success: function(data) {
                    /* now comment document created in DB, we want to render it in the UI > for this we need (content, user_name, post_id) of comment, post_id to know, under which post we need to render it => suppose data returns all these */
                    // data contains comments's post_id and user_name > fetch the post using post_id 

                    // since under some post > this comment has to be added, acc to the code > we're made the ul of the post-comments-container unique, so just prepend to the ul
                    let parentUL = $(`#post-comments-${data.data.comment.post}`);
                    let newComment = newCommentDOM(data.data.comment);
                    parentUL.prepend(newComment);

                    // attach a delete handler to the newComment
                    /* fetched the elem with reqd class in newComment */
                    deleteComment($(' .delete-comment-button', newComment));

                    // display comment created using AJAX as a notification
                    displayNotification('success', data.message);
                },
                error: function(err) {
                    // display notification of error
                    displayNotification('error', err.responseText);
                }
            })
        })
    }

    // method to render comment in UI
    let newCommentDOM = function(comment) {

        return $(`<li id="comment-${comment._id}">
                    <p>
                        <small>
                            <a class = "delete-comment-button" href="/comments/destroy/${comment._id}"><i class="fa-solid fa-trash" style="color: #ff2424;"></i>
                            </a>
                        </small>
                        <strong style="font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif; font-size: small;">${comment.content}</strong>
                        <br>
                        <small>
                            ${comment.user.name}
                        </small>
                    </p>
                </li>`)
    }

    // delete comments from DOM
    let deleteComment = function(deleteLink) {
        // deleteLink is the <a> of a particular comment to be deleted
        $(deleteLink).click(function(e) {
            e.preventDefault();

            // send AJAX req to delete the post 
            $.ajax({
                type: 'get',
                url: $(deleteLink).prop('href'), // comment deleted from DB
                success: function(data) {
                    // delete comment from UI > fetch_Comment.remove()
                    // to fetch comment: need comment id of the deleted comment so > data will return that only
                    $(`#comment-${data.data.comment_id}`).remove();
                    displayNotification('success', data.message);
                },
                error: function(err) {
                    displayNotification('error', err.responseText);
                }
            })
        })
    }


    // write functions to display notification using NOTY
    let displayNotification = function(type, message) {

        console.log('displayNotification called!');
        if(type == "success") {
            console.log('notification for success called!');
            new Noty({
                theme: 'relax', 
                text: message,
                type: 'success',
                layout: 'topRight',
                timeout: 1500 // msec
            }).show();
        }
        else if(type == "warning") {
            new Noty({
                theme: 'relax', 
                text: message,
                type: 'warning',
                layout: 'topRight',
                timeout: 1500 // msec
            }).show();
        }
        else if(type == "error") {
            new Noty({
                theme: 'relax', 
                text: message,
                type: 'error',
                layout: 'topRight',
                timeout: 1500 // msec
            }).show();
        }
    }

    createPost();
    // createPost() run only once and attach a click handler to createPost
    // as many times as you submit the form: that many times the ajax req is sent
}