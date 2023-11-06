let userAvatarInput = document.getElementById('user-avatar-input');
let profile_picture_container = document.getElementById('profile-picture-container');
let image_preview_container = document.getElementById('image-preview-container');

/* attach an event listener on the input receiving the file > 
if it contains a file > which is of jpeg/png > display it in preview(bcz not yet uploaded to db) else cur user avatar is already visible bcz it's path is uploaded to db */

userAvatarInput.addEventListener('change', function(){
    const file = userAvatarInput.files[0];

    console.log('file selected');

    if(file) {
        if(file.type === 'image/jpeg' || file.type === 'image/png') {

            console.log('jpeg/png image selected');

            /* since it's a valid image > so we can hide the prev user avatar and display this as a preview */
            profile_picture_container.style.display = 'none';

            let preview_image = document.createElement('img');
            let p = document.createElement('p');
            let br = document.createElement('br');

            p.innerHTML = 'Image Preview';

            // IMP: method to create a string containing an URL, takes file/blob object you want to create an URL for
            preview_image.src = URL.createObjectURL(file);

            image_preview_container.innerHTML = '';

            image_preview_container.appendChild(p);
            image_preview_container.appendChild(br);
            image_preview_container.appendChild(preview_image);
        }
        else {
            image_preview_container.innerHTML = 'File type is not supported for preview';
        }
    }
    else {
        // else > display the prev user avatar : which backend will automatically do
        image_preview_container.style.display = 'none';
    }
})