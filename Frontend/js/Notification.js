const socket = io("");
const chatContainer = document.getElementById("chatContainer");
socket.on("privateMessageUpdated", (message) => {
  const unreadContainer = document.getElementById(
    message.sender_username + "_unread"
  );
  renderSingleUnreadMessage(unreadContainer, message);
});
const renderDropDown = (usersMessages) => {
  Object.keys(usersMessages).forEach((username) => {
    const dropdownDiv = document.createElement("div");
    const replyBtn = document.createElement("button");
    replyBtn.className = "view btn btn-outline-info";
    replyBtn.dataset.dismiss = "modal2";
    replyBtn.textContent = "Reply";
    replyBtn.setAttribute("id", username);

    dropdownDiv.className = "dropdown";

    const dropBtn = document.createElement("button");
    dropBtn.className = "btn btn-secondary dropdown-toggle";
    dropBtn.setAttribute("type", "button");
    dropBtn.setAttribute("id", "dropdownMenuButton");
    dropBtn.setAttribute("data-toggle", "dropdown");
    dropBtn.setAttribute("aria-haspopup", "true");
    dropBtn.setAttribute("aria-expanded", "false");
    dropBtn.textContent = username;
    dropdownDiv.appendChild(dropBtn);

    // Dropdown menu
    const dropdownMenu = document.createElement("div");
    dropdownMenu.id = username + "_unread";
    dropdownMenu.className = "dropdown-menu";
    dropdownMenu.setAttribute("aria-labelledby", "dropdownMenuButton");

    // Append messages to dropdown
    usersMessages[username].forEach((message) => {
      renderSingleUnreadMessage(dropdownMenu, message);
    });

    dropdownDiv.appendChild(dropdownMenu);
    chatContainer.appendChild(dropdownDiv);
    dropdownDiv.appendChild(replyBtn);
  });
};
const getUnreadMessage = async () => {
  const url = `/messages/unread`;
  // Return the promise chain here
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const usersMessages = {};
      data.forEach((item) => {
        if (!usersMessages[item.sender_username]) {
          usersMessages[item.sender_username] = [];
        }
        usersMessages[item.sender_username].push(item);
      });
      renderDropDown(usersMessages);

      return data;
    })
    .catch((error) => {
      console.error("Error getting unread message:", error);
    });
};

const renderSingleUnreadMessage = (dropdownMenu, message) => {
  let newDom =
    `
    <div class='card message mb-1'>
    <div class='card-header ' id='messageElement'>
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

  dropdownMenu.innerHTML += newDom;
};

let userInfo = "";
let user_id = "";
const init = async () => {
  userInfo = await getUserInfo();
  try {
    const unreadMessages = await getUnreadMessage();

    if (unreadMessages.length > 0) {
      const reply = document.getElementById(unreadMessages[0].sender_username);
      let id = unreadMessages[0].sender_id;
      let name = unreadMessages[0].sender_username;
      reply.onclick = () => {
        window.parent.document.getElementById(
          "mainContent"
        ).src = `./view/PrivateChat.html?userId=${encodeURIComponent(
          id
        )}&username=${encodeURIComponent(name)}`;
      };
    }
  } catch (error) {
    console.error("Error getting unread messages:", error);
  }
};

init();
