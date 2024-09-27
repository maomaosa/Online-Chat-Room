const socket = io("");
const sendButton = document.getElementById("sendButton");
const messageInput = document.getElementById("messageInput");
const messageContainer = document.getElementById("chatContainer");
const queryString = window.location.search;
const loadMoreButtonPrivate = document.getElementById("loadMoreButtonPrivate");
const privateFilterModal = document.getElementById("privateFilterModal");
const privateFilterClose = document.getElementById("privateFilterClose");
const privateFiterResult = document.getElementById("privateFiterResult");
const privateInput = document.getElementById("privateInput");
const searchPrivate = document.getElementById("searchPrivate");
const searchBoxPrivate = document.getElementById("searchBoxPrivate");
const deletePrivateValue = document.getElementById("deletePrivateValue");
const urlParams = new URLSearchParams(queryString);
const receiverId = urlParams.get("userId");
const footer = document.getElementById("footer");
const receiverUsername = urlParams.get("username");
const receiverBox = document.getElementById("receiverBox");
const batchSize = 10;
let currentUserInfo = null;
let currentDisplayedMessages = [];
let loadMoreCounter = 0;
deletePrivateValue.onclick = () => {
  privateInput.value = "";
};
async function initializeChat() {
  try {
    currentUserInfo=await getUserInfo();
    getMessageHistory(receiverId);
    receiverBox.innerHTML = receiverUsername;
    socket.on("privateMessageUpdated", (message) => {
      
      addChatMessage(message,messageContainer);
    });
    socket.on("shareStatusChanged", (newShareStatus) => {
      currentUserInfo.shareStatus = newShareStatus;
    });
    // Additional logic to initialize the chat can go here
  } catch (error) {
    console.error("Error initializing chat:", error);
  }
}


privateFilterClose.onclick = () => {
  privateFilterModal.style.display = "none";
};
searchPrivate.onclick = async () => {
  privateFilterModal.style.display = "block";
  value = privateInput.value;
  privateFiterResult.innerHTML = "";
  currentDisplayedMessages = [];
  currentMessageBatchIndex = 0;
  loadMoreCounter = 0;
  messageInput.style.height = "80%";
  await loadLatestMessage();
};
const updateloadMoreButtonPrivateVisibility = (totalMessagesCount) => {
  if (currentDisplayedMessages.length < totalMessagesCount) {
    document.getElementById("privateLoadMoreButton").style.display = "block";
  } else {
    document.getElementById("privateLoadMoreButton").style.display = "none";
  }
};
const loadMoreMessages = async () => {
  loadMoreCounter++;
  await loadLatestMessage();
};
const loadLatestMessage = async () => {
  let inputValue = privateInput.value;
  let replacedValue = inputValue.replace(/ /g, "_");
  const messageList = await getSelectPrivateMessage(receiverId, replacedValue);
  if (inputValue === "") {
    privateFiterResult.innerHTML = "no search input";
    return;
  } else if (inputValue === "status") {
    for (let i = 0; i < messageList.length; i++) {
      addStatusMessage(messageList[i], privateFiterResult);
    }
    return;
  }
  if (messageList) {
    if (typeof messageList === "string") {
      privateFiterResult.innerHTML = messageList;
      return;
    }
    if (messageList.length === 0) {
      privateFiterResult.innerHTML = "no result";
    }
    const startIndex = batchSize * loadMoreCounter;
    const endIndex = Math.min(startIndex + batchSize, messageList.length);

    for (let i = startIndex; i < endIndex; i++) {
      const currentMessage = messageList[i];
      addChatMessage(currentMessage, privateFiterResult);
    }
    currentDisplayedMessages.push(...messageList.slice(startIndex, endIndex));
    updateloadMoreButtonPrivateVisibility(messageList.length);
  }
};

const getSelectPrivateMessage = async (receiverId, value) => {
  let replacedValue = value.replace(/ /g, "_");
  let getFilterUSerURL = `/messages/private/${receiverId}/criteriaContent/${replacedValue}`;
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
      messageList.sort((a, b) => b.timestamp - a.timestamp);
      return messageList;
    } else {
      messageList = await response.text();
    }
    return messageList;
  } catch (error) {
    console.error("Error:", error);
  }
};

function sendPrivateMessage(content, receiverId, receiverUsername) {
  fetch("/messages/private", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      messageStatus: currentUserInfo.shareStatus,
      receiverId,
      receiverUsername,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      addChatMessage(data, messageContainer);
    })
    .catch((error) => {
      console.error("Error sending private message:", error);
    });
}
sendButton.onclick = () => {
  const content = messageInput.value.trim();
  if (content) {
    sendPrivateMessage(content, receiverId, receiverUsername);
  }
};

function addStatusMessage(message, dom) {
  messageInput.value = "";
  let newDom = `<div>
  </div>
  <div class="card" style='width:80%'>
  <div class="card-body" style='display:flex;align-items: center;'>
  <div>${getRenderUserShareStatus(message.share_status)}</div>
  <div style='font-size:10px;margin-left:5px'>${formatDateString(
    message.timestamp
  )}</div>
  </div>
</div>
  `;
  dom.innerHTML += newDom;
  dom.scrollTop = dom.scrollHeight;
}
function addChatMessage(message, dom) {
  
  messageInput.value = "";
  let newDom =
    `
    <div class='card message mb-1 ${
      message.sender_username == currentUserInfo.username ? "sent" : "received"
    }'>
    <div class='card-header  ' id='messageElement'>
    <div class='header1'>
        <div class='username'>${message.sender_username}</div>
        ` +
    getRenderUserShareStatus(message.message_status) +
    `
    </div>
    <div class='timestamp'>${formatDateString(message.timestamp)}</div>
    </div>
    <div class='card-body'>
    ${message.content}
    </div>
    </div>
    `;
  dom.innerHTML += newDom;
  dom.scrollTop = messageContainer.scrollHeight;
}

function getMessageHistory(){
  const url = `/messages/private/${receiverId}`;
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      data.sort((a, b) => a.message_id - b.message_id);
      data.forEach((message) => {
        addChatMessage(message, messageContainer);
      });
    })
    .catch((error) => {
      console.error("Error sending private message:", error);
    });
};
document.addEventListener("DOMContentLoaded", async function () {
  document.getElementById("privateLoadMoreButton").style.display = "none";
  document
    .getElementById("privateLoadMoreButton")
    .addEventListener("click", loadMoreMessages);
});
initializeChat();
