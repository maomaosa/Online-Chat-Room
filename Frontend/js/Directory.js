const socket = io("");
const contentDiv = document.createElement("div");
const wrapper = document.getElementById("wrapper");
const searchShareStatus = document.getElementById("searchShareStatus");
const searchUsername = document.getElementById("searchUsername");
const inputName = document.getElementById("inputName");
const filterUsername = document.getElementById("filterUsername");
const fiterStatus = document.getElementById("fiterStatus");
const deleteInput = document.getElementById("delete");
const search = document.getElementById("search");
const inputBox = document.getElementById("inputBox");
const userList = document.getElementById("userList");
const directoryFiltermodal = document.getElementById("directoryFiltermodal");
const directoryFilterClose = document.getElementById("directoryFilterClose");
const directoryfiterResult = document.getElementById("directoryfiterResult");
searchShareStatus.style.display = "none";
let currentUserInfo = null;
let criteriaType = "";
let value = "";
search.disabled = true;
inputBox.disabled = true;
contentDiv.id = "content";
contentDiv.style = "width:100%;backgroundColor:red";
socket.on("esnDirectoryUpdated", function () {
  fetchUserList();
});
deleteInput.onclick = () => {
  inputBox.value = "";
};
const filterUsernameVariableSetting = () => {
  inputBox.value = "";
  criteriaType = "username";
  search.disabled = false;
  inputBox.disabled = false;
  searchShareStatus.style.display = "none";
  inputName.style.display = "block";
};
searchUsername.addEventListener("change", (event) => {
  if (event.target.value === "username") {
    filterUsernameVariableSetting();
  } else if (event.target.value === "shareStatus") {
    fiterStatusVariableSetting();
  }
});
const fiterStatusVariableSetting = () => {
  inputBox.value = "";
  criteriaType = "shareStatus";
  search.disabled = false;
  inputBox.disabled = false;
  searchShareStatus.style.display = "block";
  inputName.style.display = "none";
};

searchShareStatus.onchange = () => {
  value = event.target.value;
};
directoryFilterClose.onclick = () => {
  directoryFiltermodal.style.display = "none";
};
search.onclick = async () => {
  directoryFiltermodal.style.display = "block";
  if (criteriaType === "username") {
    value = inputBox.value;
  }
  const userInfo = await getFilterUser(criteriaType, value);
  directoryfiterResult.innerHTML = "";
  if (userInfo === undefined) {
    directoryfiterResult.innerHTML = "no search input";
  } else if (Array.isArray(userInfo) && userInfo.length === 0) {
    directoryfiterResult.innerHTML = "no result";
  } else {
    displayUsers(userInfo, directoryfiterResult);
  }
};
const filterStatusType = (value) => {
  if (value === "ok") {
    return 1;
  } else if (value === "help") {
    return 2;
  } else if (value === "emergency") {
    return 3;
  } else if (value === "undefined") {
    return 0;
  }
};
const getFilterUser = async (criteriaType, value) => {
  value = value.replace(/\s/g, "_");

  if (criteriaType == "shareStatus") {
    value = filterStatusType(value);
  }
  let getFilterUSerURL = `/directories/criteriaType/${criteriaType}/criteriaContent/${value}`;
  try {
    let response = await fetch(getFilterUSerURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let userInfo = await response.json();
    currentUserInfo = userInfo;
    return userInfo;
  } catch (error) {
    console.error("Error:", error);
  }
};


// Function to fetch initial user list
function fetchUserList() {
  fetch("/directories")
    .then((response) => response.json())
    .then((users) => {
      displayUsers(users);
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
}

// Function to display users in the HTML
function displayUsers(users, container) {
  if (!container) container = document.getElementById("userList");
  container.innerHTML = "";
  if (users) {
    users.forEach((user) => {
      container.appendChild(createUserElement(user));
    });
  }
}
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
// Function to create user list element
function createUserElement(user) {
  const userElement = document.createElement("a");
  if (user) {
    userElement.href = "#";
    userElement.className = `list-group-item list-group-item-action flex-column align-items-start ${
      user.online_status === 1 ? "online" : "offline"
    }`;
    userElement.innerHTML =
      `
      <div class="d-flex w-100 justify-content-between" onclick=` +
      (user.username === currentUserInfo.username
        ? "null"
        : `'userClicked("${user.user_id}","${user.username}")'`) +
      `>
      <div class="mb-1" id=${user.user_id}>${user.username} 
      ${getMessageStatusURL(user.share_status)} ${
        user.username === currentUserInfo.username ? "(You)" : ""
      }
      </div>
      
      <small class="${
        user.online_status === 1 ? "text-success" : "text-muted"
      }">
      ${
        user.online_status === 1
          ? user.username === currentUserInfo.username
            ? '<i class="fa fa-user-o" aria-hidden="true"></i> Online'
            : '<i class="bi bi-chat-dots" ></i> Online'
          : '<i class="bi bi-airplane-engines"></i> Offline'
      }
  </small>
  </div>
          `;
    return userElement;
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  currentUserInfo=await getUserInfo();
  
  fetchUserList();

  // close socket when the page is closed
  window.onbeforeunload = () => {
    socket.close();
  };
});

const userClicked = (userId, username) => {
  window.parent.document.getElementById(
    "mainContent"
  ).src = `./view/PrivateChat.html?userId=${encodeURIComponent(
    userId
  )}&username=${encodeURIComponent(username)}`;
};
