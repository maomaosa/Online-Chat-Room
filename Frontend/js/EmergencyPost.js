const postwall = document.getElementById("post-wall");
const commentwall = document.getElementById("comment-wall");
const postpage = document.getElementById("post-page");
const postButton = document.getElementById("post-button");
const postBackButton = document.getElementById("post-back-button");
const commentBackButton = document.getElementById("comment-back-button");
const postSubmitButton = document.getElementById("post-submit-button");
const commentSubmitButton = document.getElementById("comment-submit-button");
const uploadfile = document.getElementById("file-upload");
const postarea = document.getElementById("post-area");
const commentpage = document.getElementById("comment-page");
const newPostForm = document.getElementById("new-post-form");
const successPostModal = document.getElementById("success-post-modal");
const modalConfirmButton = document.getElementById("modal-confirm-button");
const socket = io("");

//buttons for switching between post page, comment page, and post area
postButton.addEventListener("click", () => {
  postarea.style.display = "none";
  postpage.style.display = "block";
  commentpage.style.display = "none";
});
postBackButton.addEventListener("click", () => {
  postarea.style.display = "block";
  postpage.style.display = "none";
  commentpage.style.display = "none";
});
commentBackButton.addEventListener("click", () => {
  postarea.style.display = "block";
  postpage.style.display = "none";
  commentpage.style.display = "none";
  unsubscribePost(document.getElementById("comment-post-id").value);
});

//if there is a picture, send the picture first, then send the post after the picture is uploaded
//if there is no picture, send the post directly
newPostForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  var file = uploadfile.files[0];
  const type = document.getElementById("accident-type").value;
  const title = document.getElementById("post-title").value;
  const address = document.getElementById("post-address").value;
  const content = document.getElementById("post-content").value;

  if (file && file.type.match("image.*")) {
    sendNewPicture(type, title, address, content, file);
  } else {
    sendNewPost(type, title, address, content, "");
  }
});

//send a new post
function sendNewPost(type, title, address, content, fileurl) {
  fetch("/emergencyposts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type,
      title,
      address,
      content,
      fileurl,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      postsuccess();
    })
    .catch((error) => {
      console.error("Error sending new post:", error);
    });
}

//send the picture to the server and get the url of the picture, send post with the picture url
function sendNewPicture(type, title, content, address, file) {
  var formDara = new FormData();
  formDara.append("image", file);
  fetch("/emergencyposts/pictures", {
    method: "POST",
    body: formDara,
  })
    .then((response) => response.text())
    .then((data) => {
      sendNewPost(type, title, content, address, data);
    })
    .catch((error) => {
      console.error("Error sending new picture:", error);
    });
}

//get all emergency posts
async function getEmergencyPosts() {
  try {
    const response = await fetch("/emergencyposts", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    for (const post of data.data) {
      await displayPost(post, postwall);
    }
  } catch (error) {
    console.error("Error getting emergency posts:", error);
  }
}

function postsuccess() {
  successPostModal.style.display = "block";
}

modalConfirmButton.addEventListener("click", () => {
  successPostModal.style.display = "none";
  postarea.style.display = "block";
  postpage.style.display = "none";
  commentpage.style.display = "none";
  postwall.innerHTML = "";
  getEmergencyPosts();
});

//*******************************************interaction part*****************************************************
//dispalay each post
async function displayPost(post, displayArea) {
  const helpResponse = await fetch(`/emergencyposts/${post.post_id}/help`, {
    method: "GET",
  });
  const clearResponse = await fetch(`/emergencyposts/${post.post_id}/clear`, {
    method: "GET",
  });
  const helpData = await helpResponse.json();
  const clearData = await clearResponse.json();
  const helpCount = helpData.data.length;
  const clearCount = clearData.data.length;
  const currentUser = await getCurrentUser();
  //check if the current user has helped or cleared the post
  const helpedUserIds = helpData.data.map((item) => item.user_id);
  const clearedUserIds = clearData.data.map((item) => item.user_id);
  const userHelped = helpedUserIds.includes(currentUser.userId);
  const userCleared = clearedUserIds.includes(currentUser.userId);
  const helpButtonClass = userHelped ? "help-button-helped" : "help-button";
  const clearedButtonClass = userCleared
    ? "cleared-button-cleared"
    : "cleared-button";

  var postHtml = `
        <div class="post-container">
            <div class="post-header">
                <div class="post-type">${post.accident_category}: ${
    post.title
  }</div>
                <div class="post-address">Address: ${post.address}</div>
                <div class="post-time">${new Date(
                  post.post_time
                ).toLocaleString()}</div>
            </div>
            <div class="post-content">
                ${post.user_name}: ${post.content}
            </div>
            <div class="post-image">
                ${
                  post.picture_url
                    ? `<img src="${post.picture_url}" alt="Post Image">`
                    : ""
                }
            </div>
            <div class="post-actions">
                    <button class="${helpButtonClass}" post-id = ${
    post.post_id
  }>I can help (${helpCount})</button>
                    <button class="${clearedButtonClass}" post-id = ${
    post.post_id
  }>Cleared (${clearCount})</button>
                    <button class="comment-button" post-id = ${post.post_id}>
                        <i class="fas fa-comment"></i>
                    </button>
            </div>
        </div>
    `;
  displayArea.innerHTML += postHtml;
}
//display single post
async function displaySinglePost(postid, displayArea) {
  try {
    const response = await fetch(`/emergencyposts/${postid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data && data.data && data.data.length > 0) {
      await displayPost(data.data[0], displayArea);
    }
  } catch (error) {
    console.error("Error getting emergency posts:", error);
  }
}

//add event listener to comment button
commentSubmitButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const contentarea = document.getElementById("comment-content");
  const content = contentarea.value;
  const postid = document.getElementById("comment-post-id").value;
  contentarea.value = "";
  sendNewComment(content, postid);
});

//send a new comment for a post
function sendNewComment(content, postid) {
  fetch(`/emergencyposts/${postid}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      postid,
    }),
  })
    .then((response) => response.json())
    .then((data) => {})
    .catch((error) => {
      console.error("Error sending new comment:", error);
    });
}

//get all comments for a single post
async function getComments(postid) {
  fetch(`/emergencyposts/${postid}/comments`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      data.data.forEach((comment) => {
        displayCommnets(comment, commentwall);
      });
    })
    .catch((error) => {
      console.error("Error getting comments:", error);
    });
}

//display each comment
function displayCommnets(comment, displayArea) {
  var commentHtml = `
        <div class = "comment-container">
            <div class="comment-header">
                <div class="comment-user">${comment.user_name}: </div>
                <div class="comment-time">${new Date(
                  comment.comment_time
                ).toLocaleString()}</div>
            </div>
            <div class="comment-content">
                ${comment.comment_content}
            </div>
        </div>
    `;
  displayArea.innerHTML += commentHtml;
}

//display the comment page for a single post
async function displayCommentPage(postid) {
  commentwall.innerHTML = ""; //clear the comment page
  postarea.style.display = "none";
  postpage.style.display = "none";
  commentpage.style.display = "block";
  //set the post id for the comment submit button
  document.getElementById("comment-post-id").value = postid;
  //remove the comment button after the post is clicked
  await displaySinglePost(postid, commentwall); // Wait until the post is displayed
  const commentButtons = commentwall.querySelectorAll(".comment-button");
  commentButtons.forEach((button) => button.remove());
  await getComments(postid); //get all comments for the post and display them
  await subscribePost(postid); //subscribe to the post comments
}

//subscribe to the post comments
async function subscribePost(postid) {
  try {
    const socketid = socket.id;
    const response = await fetch(`/emergencyposts/${postid}/subscribe`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        socketid,
      }),
    });
    return true;
  } catch (error) {
    console.error("Error subscribing comments:", error);
    return false;
  }
}

//unsubscribe to the post comments
async function unsubscribePost(postid) {
  try {
    const socketid = socket.id;
    const response = await fetch(`/emergencyposts/${postid}/unsubscribe`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        socketid,
      }),
    });
    return true;
  } catch (error) {
    console.error("Error unsubscribing comments:", error);
    return false;
  }
}

//*******************************************interaction part*****************************************************

async function addHelpLabel(postid) {
  try {
    const response = await fetch(`/emergencyposts/${postid}/help`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (error) {
    console.error("Error post help label:", error);
    return false;
  }
}

async function addClearLabel(postid) {
  try {
    const response = await fetch(`/emergencyposts/${postid}/clear`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (error) {
    console.error("Error post clear label:", error);
    return false;
  }
}

async function deleteHelpLabel(postid) {
  try {
    const response = await fetch(`/emergencyposts/${postid}/help`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (error) {
    console.error("Error delete help label:", error);
    return false;
  }
}

async function deleteClearLabel(postid) {
  try {
    const response = await fetch(`/emergencyposts/${postid}/clear`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return true;
  } catch (error) {
    console.error("Error delete clear label:", error);
    return false;
  }
}

async function getCurrentUser() {
  try {
    const response = await fetch("/users/currentUser/info", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting current user:", error);
  }
}

//after load the page, add event listener to each post
document.addEventListener("click", async (event) => {
  const target = event.target;
  const postId = target.getAttribute("post-id");

  if (
    target.classList.contains("help-button") ||
    target.classList.contains("help-button-helped")
  ) {
    const hasHelped = target.classList.contains("help-button-helped");
    if (hasHelped) {
      await deleteHelpLabel(postId);
      target.classList.remove("help-button-helped");
      target.classList.add("help-button");
    } else {
      await addHelpLabel(postId);
      target.classList.add("help-button-helped");
      target.classList.remove("help-button");
    }

    //update for single user, abandoned
    //const helpResponse = await fetch(`/emergencyposts/${postId}/help`, { method: 'GET' });
    //const helpData = await helpResponse.json();
    //target.innerText = `I can help (${helpData.data.length})`;
  } else if (
    target.classList.contains("cleared-button") ||
    target.classList.contains("cleared-button-cleared")
  ) {
    const hasCleared = target.classList.contains("cleared-button-cleared");
    if (hasCleared) {
      await deleteClearLabel(postId);
      target.classList.remove("cleared-button-cleared");
      target.classList.add("cleared-button");
    } else {
      await addClearLabel(postId);
      target.classList.add("cleared-button-cleared");
      target.classList.remove("cleared-button");
    }
    //update for single user, abandoned
    //const clearResponse = await fetch(`/emergencyposts/${postId}/clear`, { method: 'GET' });
    //const clearData = await clearResponse.json();
    //target.innerText = `Cleared (${clearData.data.length})`;
  }
});
//for comment icon
document.addEventListener("click", async (event) => {
  const target = event.target.closest(".comment-button");
  if (target && target.hasAttribute("post-id")) {
    const postId = target.getAttribute("post-id");
    await displayCommentPage(postId);
  }
});

//socket.io part
socket.on("newPost", (newpost) => {
  displaySinglePost(newpost.post_id, postwall);
});

socket.on("PostLabelAddEvent", (data) => {
  const { post_id, label } = data;
  if (label === "help") {
    addHelpLabelforAll(post_id);
  }
  if (label === "clear") {
    addClearLabelforAll(post_id);
  }
});

function updateHelpLabels(postid, operation) {
  const helpButtons = document.querySelectorAll(
    `button.help-button[post-id="${postid}"]`
  );
  const helpedButtons = document.querySelectorAll(
    `button.help-button-helped[post-id="${postid}"]`
  );
  if (helpButtons) {
    helpButtons.forEach((button) => {
      let count = parseInt(button.textContent.match(/\d+/)[0], 10);
      count = operation(count);
      button.textContent = `I can help (${count})`;
    });
  }
  if (helpedButtons) {
    helpedButtons.forEach((button) => {
      let count = parseInt(button.textContent.match(/\d+/)[0], 10);
      count = operation(count);
      button.textContent = `I can help (${count})`;
    });
  }
}

function addHelpLabelforAll(postid) {
  updateHelpLabels(postid, (count) => count + 1);
}

function deleteHelpLabelforAll(postid) {
  updateHelpLabels(postid, (count) => count - 1);
}


socket.on("PostLabelDeleteEvent", (data) => {
  const { post_id, label } = data;
  if (label === "help") {
    deleteHelpLabelforAll(post_id);
  }
  if (label === "clear") {
    deleteClearLabelforAll(post_id);
  }
});



function deleteClearLabelforAll(postid) {
  const clearButtons = document.querySelectorAll(
    `button.cleared-button[post-id="${postid}"]`
  );
  const clearedButtons = document.querySelectorAll(
    `button.cleared-button-cleared[post-id="${postid}"]`
  );
  if (clearButtons) {
    clearButtons.forEach((button) => {
      let count = parseInt(button.textContent.match(/\d+/)[0], 10);
      count -= 1;
      button.textContent = `Cleared (${count})`;
    });
  }
  if (clearedButtons) {
    clearedButtons.forEach((button) => {
      let count = parseInt(button.textContent.match(/\d+/)[0], 10);
      count -= 1;
      button.textContent = `Cleared (${count})`;
    });
  }
}

socket.on("newComment", (newcomment) => {
  displayCommnets(newcomment, commentwall);
});
getEmergencyPosts();
