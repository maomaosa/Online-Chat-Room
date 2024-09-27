const sendButton = document.getElementById("sendButton");
const messageInput = document.getElementById("messageInput");
const messagesContainer = document.getElementById("chatContainer");
const announcementInput = document.getElementById("announcementInput");
const searchAnnouncement = document.getElementById("searchAnnouncement");
const searchBoxAnnouncement = document.getElementById("searchBoxAnnouncement");
const announcementfiterResult=document.getElementById('announcementfiterResult')
const deleteAnnouncementValue = document.getElementById(
  "deleteAnnouncementValue"
);
const loadMoreButtonAnnoucement = document.getElementById(
  "loadMoreButtonAnnoucement"
);
const announcementFiltermodal=document.getElementById('announcementFiltermodal')
const announcementFilterClose=document.getElementById('announcementFilterClose')
const socket = io("");
let userInfo = null;
let currentDisplayedMessages = [];
let loadMoreCounter = 0;
const batchSize = 10;

deleteAnnouncementValue.onclick = () => {
  announcementInput.value = "";
};
announcementFilterClose.onclick=()=>{
  announcementFiltermodal.style.display='none'
}
searchAnnouncement.onclick = async () => {
  announcementFiltermodal.style.display='block'
  value = announcementInput.value;
  announcementfiterResult.innerHTML = "";
  loadMoreCounter=0;
  currentDisplayedMessages = [];
  currentMessageBatchIndex = 0;
  messageInput.style.height = "80%";
  await loadLatestMessageAnnouncement();
};
const loadAnnouncementMoreMessages = async () => {
  loadMoreCounter++;
  await loadLatestMessageAnnouncement();
};
const loadLatestMessageAnnouncement = async () => {
  let inputValue = announcementInput.value;
  if (inputValue === "") {
    announcementfiterResult.innerHTML = "no search input";
    return;
  }
  let replacedValue = inputValue.replace(/ /g, "_");
  const messageList = await getSelectAnnouncementMessage(replacedValue);
  if (messageList) {
    if (typeof messageList === "string") {
      announcementfiterResult.innerHTML = messageList;
      return;
    }
    if (messageList.length === 0) {
      announcementfiterResult.innerHTML = "no result";
    }

    const startIndex = batchSize * loadMoreCounter;
    const endIndex = Math.min(startIndex + batchSize, messageList.length);
    if (announcementInput.value == "status") {
      for (let i = startIndex; i < endIndex; i++) {
        const currentMessage = messageList[i];
        displayAnnouncement(
          currentMessage.sender_username,
          currentMessage.message_status,
          formatDateString(currentMessage.timestamp),
          currentMessage.content,
          announcementfiterResult
        );
      }
    } else {
      for (let i = startIndex; i < endIndex; i++) {
        const currentMessage = messageList[i];
        displayAnnouncement(
          currentMessage.sender_username,
          currentMessage.message_status,
          formatDateString(currentMessage.timestamp),
          currentMessage.content,
          announcementfiterResult
        );
      }
    }
    currentDisplayedMessages.push(...messageList.slice(startIndex, endIndex));
    updateloadMoreButtonAnnoucementVisibility(messageList.length);
  }
};
const getSelectAnnouncementMessage = async () => {
  let value = announcementInput.value;
  let replacedValue = value.replace(/ /g, "_");
  let getFilterUSerURL = `/messages/announcement/criteriaContent/${replacedValue}`;
  try {
    let response = await fetch(getFilterUSerURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const contentType = response.headers.get("Content-Type");
    let messageList;
    if (contentType && contentType.includes("application/json")) {
      messageList = await response.json();
      messageList.sort((a, b) => a.timestamp - b.timestamp);
      return messageList.reverse()
    } else {
      messageList = await response.text();
      return messageList
    }

  } catch (error) {
    console.error("Error:", error);
  }
};
sendButton.addEventListener("click", function () {
  const messageText = messageInput.value.trim();
  if (messageText) {
    postAnnouncement(userInfo.shareStatus, messageText);
  }
  messageInput.value = "";
});
document.addEventListener("DOMContentLoaded", async function () {
  document.getElementById("loadMoreButtonAnnoucement").style.display = "none";
  document
    .getElementById("loadMoreButtonAnnoucement")
    .addEventListener("click", loadAnnouncementMoreMessages);
});

socket.on("messageUpdated", (data) => {
  displayAnnouncement(
    data.sender_username,
    data.message_status,
    formatDateString(data.timestamp),
    data.content,
    messagesContainer
  );
});
const updateloadMoreButtonAnnoucementVisibility = (totalMessagesCount) => {
  if (currentDisplayedMessages.length < totalMessagesCount) {
    document.getElementById("loadMoreButtonAnnoucement").style.display =
      "block";
  } else {
    document.getElementById("loadMoreButtonAnnoucement").style.display = "none";
  }
};
//post announcement to backend
const postAnnouncement = async (status, content) => {
  let postAnnouncementURL = "/messages/announcement";
  try {
    let response = await fetch(postAnnouncementURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageStatus: status,
        content: content,
      }),
    });
    if (!response.ok) {
      console.error("Error: announcement not inserted");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

//get all announcements for announcement wall
const getAnnouncements = async () => {
  let getAnnouncementsURL = "/messages/announcement";
  try {
    let response = await fetch(getAnnouncementsURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 500) {
      return null;
    }
    let announcementList = await response.json();
    announcementList.sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 0; i < announcementList.length; i++) {
      displayAnnouncement(
        announcementList[i].sender_username,
        announcementList[i].message_status,
        formatDateString(announcementList[i].timestamp),
        announcementList[i].content,
        messagesContainer
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

//display announcement except for status, announcement does not have status
const displayAnnouncement = (username, status, time, message,dom) => {
  var messageHtml = `
              <div class="card message mb-1">
              <div class="card-header">
                  <div class="username">${username}</div>
                  <div class="card-subtitle timestamp text-muted">${time}</div> 
    
              </div>
              <div class="card-body">${message}</div>
              </div>
          `;
  dom.innerHTML += messageHtml;
  dom.scrollTop = messagesContainer.scrollHeight;
};

document.addEventListener("DOMContentLoaded", async function () {
  userInfo = await getUserInfo();
  adjustVisibilityBasedOnPrivilege(userInfo.privilegeLevel);

});
getAnnouncements();

// Function to hide or show elements based on privilege level
function adjustVisibilityBasedOnPrivilege(privilegeLevel) {
  if (privilegeLevel === 1 || privilegeLevel === 2) {
      // Show message input and send button if privilege level is 1 or 2
      messageInput.style.display = 'block';
      sendButton.style.display = 'block';
  } else {
      // Hide message input and send button otherwise
      messageInput.style.display = 'none';
      sendButton.style.display = 'none';
  }
}
