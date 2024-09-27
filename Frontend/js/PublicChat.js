const sendButton = document.getElementById("sendButton");
const logoutButton = document.getElementById("logoutButton");
const messageInput = document.getElementById("messageInput");
const userContainer = document.getElementById("userContainer");
const messagesContainer = document.getElementById("chatContainer");
const friends = document.getElementById("friends");
const status = document.getElementById("status");
const statusModal = document.getElementById("statusModal");
const inputBox = document.getElementById("inputBox");
const searchPublic = document.getElementById("searchPublic");
const footer = document.getElementById("footer");
const loadMoreButton = document.getElementById("loadMoreButton");
const deletePublicValue = document.getElementById("deletePublicValue");
const fiterResult=document.getElementById("fiterResult");
const socket = io("");
const publicFiltermodal = document.getElementById("publicFiltermodal");
const publicFilterClose = document.getElementsByClassName("publicFilterClose")[0];
let userInfo = null;
const batchSize = 10;
let currentDisplayedMessages = [];
let loadMoreCounter = 0;
deletePublicValue.onclick = () => {
  inputBox.value = "";
};
// Send a message
sendButton.addEventListener("click", function () {
  const messageText = messageInput.value.trim();
  if (messageText) {
    postMessage(userInfo.shareStatus, messageText);
  }
  messageInput.value = "";
});
socket.on("messageUpdated", (data) => {
  displayMessage(
    data.sender_username,
    data.message_status,
    formatDateString(data.timestamp),
    data.content,
    messagesContainer
  );
});
searchPublic.onclick = async () => {
  publicFiltermodal.style.display = "block";
  fiterResult.innerHTML = "";
  currentDisplayedMessages = [];
  loadMoreCounter = 0; 
  currentMessageBatchIndex = 0;
  await loadLatestMessage();
};
publicFilterClose.onclick = function() {
  publicFiltermodal.style.display = "none";
}
const loadLatestMessage = async () => {

  let inputValue = inputBox.value;
  if (inputValue === "") {
    fiterResult.innerHTML = "no search input";
    return;
  }
  let replacedValue = inputValue.replace(/ /g, "_");
  const messageList = await getSelectPublicMessage(replacedValue);
  if (messageList) {
    if (typeof messageList === "string") {
      fiterResult.innerHTML = messageList;
      return;
    }
    if (messageList.length === 0) {
      fiterResult.innerHTML = "no result";
    }
    const startIndex = batchSize * loadMoreCounter;
    const endIndex = Math.min(startIndex + batchSize, messageList.length);
    for (let i = startIndex; i < endIndex; i++) {
      const currentMessage = messageList[i];
      displayMessage(
        currentMessage.sender_username,
        currentMessage.message_status,
        formatDateString(currentMessage.timestamp),
        currentMessage.content,
        fiterResult
      );
    }

    currentDisplayedMessages.push(...messageList.slice(startIndex, endIndex));

    updateLoadMoreButtonVisibility(messageList.length);
  }
};

const loadMoreMessages = async () => {
  loadMoreCounter++;
  await loadLatestMessage();
};
const updateLoadMoreButtonVisibility = (totalMessagesCount) => {
  if (currentDisplayedMessages.length < totalMessagesCount) {
    document.getElementById("loadMoreButton").style.display = "block";
  } else {
    document.getElementById("loadMoreButton").style.display = "none";
  }
};

const getSelectPublicMessage = async (value) => {
  let getFilterUSerURL = `/messages/public/criteriaContent/${value}`;
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
      return messageList.reverse();
    } else {
      messageList = await response.text();
      return messageList
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
};

postMessage = async (status, content) => {
  let postMessageURL = "/messages/public";
  try {
    let response = await fetch(postMessageURL, {
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
      console.error("Error: message not inserted");
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const getPublicMessages = async () => {
  let getPublicMessagesURL = "/messages/public";
  try {
    let response = await fetch(getPublicMessagesURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 500) {
      return null;
    }
    let messageList = await response.json();
    messageList.sort((a, b) => a.timestamp - b.timestamp);
    for (let i = 0; i < messageList.length; i++) {
      const currentMessage = messageList[i];
      displayMessage(
        currentMessage.sender_username,
        currentMessage.message_status,
        formatDateString(currentMessage.timestamp),
        currentMessage.content,
        messagesContainer
      );
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const displayMessage = (username, status, time, message,dom) => {
  var messageHtml =
    `
    <div class="card message mb-1">
      <div class="card-header public-card-header">
        <div class="username">${username}` +
    getMessageStatusURL(status) +
    `</div>
        <div class="card-subtitle timestamp text-muted">${time}</div>
      </div>
      <div class="card-body">${message}</div>
    </div>
  `;
  
  dom.insertAdjacentHTML("beforeend", messageHtml);
};

const getMessageStatusURL = (status) => {
  switch (status) {
    case 1:
      return '<i class="fa fa-check-circle " aria-hidden="true"></i>';
    case 2:
      return '<i class="fa fa-exclamation-circle " aria-hidden="true"></i>';
    case 3:
      return '<i class="fa fa-plus-square " aria-hidden="true"></i>';
    case 0:
      return '<i class="fa fa-ban " aria-hidden="true"></i>';
    default:
      return "";
  }
};

socket.on("shareStatusChanged", function (newShareStatus) {
  userInfo.shareStatus = newShareStatus;
});

document.addEventListener("DOMContentLoaded", async function () {
  userInfo = await getUserInfo();
  document.getElementById("loadMoreButton").style.display = "none";
  document
    .getElementById("loadMoreButton")
    .addEventListener("click", loadMoreMessages);
});
getPublicMessages();
