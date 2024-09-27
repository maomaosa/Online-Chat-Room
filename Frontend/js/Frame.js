const publicChat = document.getElementById("publicChat");
const logoutButton = document.getElementById("logoutButton");
const friends = document.getElementById("friends");
const resource = document.getElementById("resource");
const status_edit = document.getElementById("status-edit");
const statusModal = document.getElementById("statusModal");
const confirmButton = document.getElementById("confirm");
const closeBtn = document.getElementById("statusModalClose");
const contentElement = document.getElementById("mainContent");
const contentDiv = document.createElement("div");
const editProfileBtn = document.getElementById("editProfileBtn");
const notificationModal = document.getElementById("notificationBox");
const notificationModalCloseElement = document.getElementsByClassName(
  "notificationModalClose"
)[0];
const speedtest = document.getElementById("speedtest");
const ESNguide = document.getElementById("ESNguide");
const confirmGenderChange = document.getElementById("confirmGenderChange");
const genderDisplay = document.getElementById("genderDisplay");
const shareStatusDiv = document.getElementById("shareStatusDiv");
confirmGenderChange.addEventListener("click", function (event) {
  event.preventDefault();
  const activeGenderOption = document.querySelector(".gender-option.active");
  const selectedGenderValue = activeGenderOption.getAttribute("data-value");
  genderDisplay.textContent =
    selectedGenderValue.charAt(0).toUpperCase() + selectedGenderValue.slice(1); // Capitalize the first letter
  const editGenderModal = document.getElementById("editGenderModal");
  editGenderModal.style.display = "none";
});
const editProfileModal = document.getElementById("editProfileModal");
const editClose = document.getElementById("editClose");
const notification = document.getElementById("notification");
const shareHelp = document.getElementById("shareHelp");
const viewBtn = document.getElementById("viewBtn");
const announcement = document.getElementById("announcement");
const editGender = document.getElementById("editGender");
const editJobType = document.getElementById("editJobType");
const editGenderModal = document.getElementById("editGenderModal");
const editJobTypeModal = document.getElementById("editJobTypeModal");
const genderModalClose = document.getElementById("genderModalClose");
const jobTypeModalClose = document.getElementById("jobTypeModalClose");
const jobType = document.getElementById("jobType");
let unreadMessagesCount = 0;
const maxReconnectAttempts = 5;
let reconnectAttempts = 0;
const reconnectInterval = 2000;
const prevBtn = document.querySelector(".prevBtn");
const nextBtn = document.querySelector(".nextBtn");
const toothIconImage = document.getElementById("toothIconDiv");
const toothIconLabel = document.getElementById("toothIconLabel");
const saveJobType = document.getElementById("saveJobType");
const ConfirmtoEdit = document.getElementById("ConfirmtoEdit");
const sideBar=document.getElementById("sidebar-wrapper");
const userManagement=document.getElementById('userManagement')
let currentIconIndex = 0;
let showSideBar=document.querySelector('.show')

if(showSideBar){
  contentElement.style.width='100%'
}
const icons = [
  "../images/null.jpg",
  "../images/doctor.jpg",
  "../images/dentist.jpg",
  "../images/nurse.jpg",
  "../images/psychologist.jpg",
  "../images/police.jpg",
  "../images/firefighter.jpg",
];

const saveJobTypeByfiter = (currentIconIndex) => {
  switch (currentIconIndex) {
    case 0:
      jobType.innerHTML = "Null";
      break;
    case 1:
      jobType.innerHTML = "Doctor";
      break;
    case 2:
      jobType.innerHTML = "Dentist";
      break;
    case 5:
      jobType.innerHTML = "Police";
      break;
    case 6:
      jobType.innerHTML = "Firefighter";
      break;
    case 4:
      jobType.innerHTML = "Psychologist";
      break;
    case 3:
      jobType.innerHTML = "Nurse";
      break;
  }
};
const fiterJobtype = (currentIconIndex) => {
  switch (currentIconIndex) {
    case 0:
      toothIconLabel.textContent = "Null";

      break;
    case 1:
      toothIconLabel.textContent = "Doctor";

      break;
    case 2:
      toothIconLabel.textContent = "Dentist";

      break;
    case 5:
      toothIconLabel.textContent = "Police";

      break;
    case 6:
      toothIconLabel.innerText = "Firefighter";

      break;
    case 4:
      toothIconLabel.textContent = "Psychologist";

      break;
    case 3:
      toothIconLabel.textContent = "Nurse";

      break;
  }
};

async function initializeUI() {
  const userInfo = await getUserInfo(); // Fetch user info including privilege level
  renderUIBasedOnPrivilege(userInfo.privilegeLevel);
}

function renderUIBasedOnPrivilege(privilegeLevel) {
  if (privilegeLevel === 2) { // Assuming 2 is the privilege level required to see these features
      speedtest.style.display = 'block'; // Make speed test visible
  } else {
      speedtest.style.display = 'none'; // Hide speed test
  }
}

function updateProfileForm(data) {
  const defaultJobType = 0;
  document.getElementById("name").value = data.username || "";
  // document.getElementById("password").value = data.password || "";
  phone.value = data.phone_number || "";
  if (phone.value.length == 10) {
    ConfirmtoEdit.disabled = false;
  }
  message.value = data.message_content || "";
  const genderText = {
    0: "Other",
    1: "Male",
    2: "Female",
  };
  let jobtypeData = data.job_type === null ? defaultJobType : data.job_type;
  document.getElementById("genderDisplay").textContent =
    genderText[data.gender.toString()] || "Other";
  document.getElementById("jobType").textContent =
    jobTypelist[jobtypeData.toString()] || "";
}
async function getUserProfile(userInfo) {
  let url = `/userProfiles/${userInfo.username}`;
  try {
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let userProfile = await response.json();
    if (userProfile && userProfile.data) {
      let data = userProfile.data;
      currentIconIndex =
        data.job_type !== null && data.job_type !== undefined
          ? data.job_type
          : 0;
      updateIconAndLabel();
      updateProfileForm(data);
      return data;
    }
    return userProfile.data;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function initializeCurrentIconIndex() {
  const userInfo = await getUserInfo();
  if(userInfo.privilegeLevel===0||userInfo.privilegeLevel===1){
    userManagement.style.display='none'
  }
  const userProfile = await getUserProfile(userInfo);
  if (userProfile && userProfile.job_type !== undefined) {
    currentIconIndex = userProfile.job_type;
    updateIconAndLabel();
  }
}
const updateIconAndLabel = () => {
  toothIconDiv.src = icons[currentIconIndex];
  fiterJobtype(currentIconIndex);
};
// updateIconAndLabel();
const squares = document.querySelectorAll(".square");
const genderOptions = document.querySelectorAll(".gender-option");
prevBtn.addEventListener("click", function () {
  currentIconIndex--;
  if (currentIconIndex < 0) {
    currentIconIndex = icons.length - 1;
  }
  updateIconAndLabel();
});

nextBtn.addEventListener("click", function () {
  currentIconIndex++;
  if (currentIconIndex >= icons.length) {
    currentIconIndex = 0;
  }
  updateIconAndLabel();
});

const alertDisplayElementST = document.getElementById(
  "alert-display-speed-test"
);

let userInfo = undefined;
const displayAlert = (message) => {
  alertDisplayElementST.innerHTML = message;
  alertDisplayElementST.style.display = "block";
};


let currentShareStatusId = null;
confirmButton.style.display = "none";

const SHARE_STATUS_VALUE = {
  undefined: 0,
  ok: 1,
  help: 2,
  emergency: 3,
};
const showMadal2 = () => {
  notificationModal.classList.add("show");
  setTimeout(() => {
    notificationModal.classList.remove("show");
  }, 5000);
};

confirmButton.onclick = () => {
  fetch("/shareStatuses/currentUser", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      status: currentShareStatusId,
    }),
  }).then((res) => {
    if (res.status != 200) {
      hideModal();
      displayAlert("Changing status failed!");
    } else {
      hideModal();
      renderUserShareStatus(currentShareStatusId);
    }
  });
};
const getUnreadMessage = () => {
  const url = `/messages/unread`;
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.length > 0) {
        const unreadNo = document.createElement("div");
        unreadNo.className = "unreadDiv";
        notification.appendChild(unreadNo);
        unreadMessagesCount = data.length;
        renderUnreadNumber();
      }
    })
    .catch((error) => {
      console.error("Error getting unread message:", error);
    });
};

const renderUnreadNumber = () => {
  const unreadDivContainer = document.getElementsByClassName("unreadDiv");
  if (unreadDivContainer.length > 0) {
    unreadDivContainer[0].innerText = unreadMessagesCount;
  }
};
logoutButton.addEventListener("click", function () {
  const url = "/users/currentUser/offline";
  fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  }).then(() => {
    window.location.href = "/";
  });
});

const toggleBorder = (event) => {
  confirmButton.style.display = "block";

  squares.forEach((square) => {
    if (square !== event.currentTarget) {
      square.style.border = "5px solid rgba(0,0,0,0)";
    }
  });

  const element = event.currentTarget;

  const style = window.getComputedStyle(element);
  const hasBorder = style.border === "5px solid rgb(61, 124, 144)";

  if (!hasBorder) {
    confirmButton.style.display = "block";
    element.style.border = "5px solid rgb(61, 124, 144)";
    currentShareStatusId = SHARE_STATUS_VALUE[element.id];
  } else {
    confirmButton.style.display = "none";
    element.style.border = "5px solid rgb(0,0,0,0)";
  }
};

const showModal = () => {
  statusModal.style.display = "block";
};
const hideModal = () => {
  statusModal.style.display = "none";
};

const errorForphonenumber = document.getElementById("errorForphonenumber");
const phone = document.getElementById("phone");
const message = document.getElementById("message");
function toggleConfirmButton() {
  ConfirmtoEdit.disabled = !checkPhoneNumberLength();
}
function checkPhoneNumberLength() {
  const phoneValue = phone.value;
  return phoneValue.length === 10;
}
phone.addEventListener("input", function () {
  let phoneNumber = this.value;
  if (phoneNumber.length !== 10) {
    displayAlert("Phone number must be 10 digits long.");
  } else {
    errorForphonenumber.style.display = "none";
  }

  toggleConfirmButton();
});
var popover = new bootstrap.Popover(message, {
  trigger: "manual",
  content: "Message cannot exceed 64 characters",
  placement: "bottom",
});
message.addEventListener("input", function () {
  if (message.value.length > 64) {
    message.value = message.value.substr(0, 64);
    popover.show();
  } else {
    popover.hide();
  }
});
const jobTypelist = {
  0: "Null",
  1: "Doctor",
  2: "Dentist",
  3: "Nurse",
  4: "Psychologist",
  5: "Police",
  6: "FireFighter",
};

saveJobType.onclick = () => {
  editJobTypeModal.style.display = "none";
  fiterJobtype(currentIconIndex);
  saveJobTypeByfiter(currentIconIndex);
};
status_edit.onclick = () => {
  showModal();
};
closeBtn.onclick = () => {
  hideModal();
};
confirmGenderChange.onclick = () => {
  editGenderModal.style.display = "none";
};

editClose.onclick = () => {
  editProfileModal.style.display = "none";
};
editGender.onclick = () => {
  editGenderModal.style.display = "block";
};
genderModalClose.onclick = () => {
  editGenderModal.style.display = "none";
};
editJobType.onclick = () => {
  editJobTypeModal.style.display = "flex";
};
jobTypeModalClose.onclick = () => {
  editJobTypeModal.style.display = "none";
};

const renderUsername = (username) => {
  const usernameElement = document.getElementById("username");
  if (usernameElement) {
    usernameElement.textContent = username;
  }
};

const renderUserShareStatus = (shareStatus) => {
  const statusElement = document.getElementById("status");
  switch (shareStatus) {
    case 1:
      statusElement.innerHTML =
        '<i class="fa fa-check-circle fa-lg" aria-hidden="true"></i>';
      shareStatusDiv.innerHTML =
        '<i class="fa fa-check-circle fa-lg" aria-hidden="true"></i>';
      break;
    case 2:
      statusElement.innerHTML =
        '<i class="fa fa-exclamation-circle fa-lg" aria-hidden="true"></i>';
      shareStatusDiv.innerHTML =
        '<i class="fa fa-exclamation-circle fa-lg" aria-hidden="true"></i>';
      break;
    case 3:
      statusElement.innerHTML =
        '<i class="fa fa-plus-square fa-lg" aria-hidden="true"></i>';
      shareStatusDiv.innerHTML =
        '<i class="fa fa-plus-square fa-lg" aria-hidden="true"></i>';
      break;
    case 0:
    default:
      statusElement.innerHTML =
        '<i class="fa fa-ban fa-lg" aria-hidden="true"></i>';
      statusElement.innerHTML =
        '<i class="fa fa-ban fa-lg" aria-hidden="true"></i>';
      break;
  }
};
document.getElementById("mainContent").addEventListener("load", function () {
  const socket=io("")
  socket.on("inactiveAccount",(message)=>{
    console.log(message)
    // $('#inactiveAccountModal').modal('show');
    // setTimeout(() => {
    //   $('#inactiveAccountModal').modal('hide');
    //   setTimeout(() => {
    //     window.location.href = `${ROUTER_PREFIX}/`;
    //   }, 500);
    // }, 5000); 
  })
})
document.addEventListener("DOMContentLoaded", async function () {
  initializeUI();
  const socket=io("")
  socket.on("privateMessageUpdated", () => {
    unreadMessagesCount += 1;
    renderUnreadNumber();
  });
socket.on("messagesRead", (messages) => {
    unreadMessagesCount = messages.length;
    renderUnreadNumber();
  });

    
  socket.on("speedTestAlert", (msg) => {
    displayAlert(msg);
    // Clear all cookies

    document.cookie.split(";").forEach(function (c) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    const url = "/users/currentUser/offline";
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(() => {
      window.location.href = `${ROUTER_PREFIX}/`;
    });
  });
  document.getElementById("mainContent").addEventListener("load", function () {
    socket.close();
  });

  try {
    await initializeCurrentIconIndex();
  } catch (error) {
    console.error("Error during initialization:", error);
  }
  squares.forEach((square) => {
    square.addEventListener("click", toggleBorder);
  });
  function changeActiveTab(activeTab) {
    const allTabs = [
      publicChat,
      friends,
      resource,
      notification,
      announcement,
      speedtest,
      ESNguide,
      emergencypost,
      shareHelp,
      userManagement
    ];
    allTabs.forEach((tab) => {
      tab.classList.remove("active");
    });
    activeTab.classList.add("active");
  }
  userManagement.onclick=()=>{
    contentElement.src = "./view/UserProfile.html";
    changeActiveTab(userManagement);
  }
  speedtest.onclick = () => {
    contentElement.src = "./view/SpeedTest.html";
    changeActiveTab(speedtest);
  };
  publicChat.onclick = () => {
    contentElement.src = "./view/PublicChat.html";
    changeActiveTab(publicChat);
  };
  friends.onclick = () => {
    contentElement.src = "./view/Directory.html";
    changeActiveTab(friends);
  };
  resource.onclick = () => {
    contentElement.src = "./view/Resource.html";
    changeActiveTab(resource);
  };
  notification.onclick = () => {
    contentElement.src = "./view/Notification.html";
    changeActiveTab(notification);
  };
  announcement.onclick = () => {
    contentElement.src = "./view/Announcement.html";
    changeActiveTab(announcement);
  };
  ESNguide.onclick = () => {
    contentElement.src = "./view/ESNGuide.html";
    changeActiveTab(ESNguide);
  };
  shareHelp.onclick = () => {
    contentElement.src = "./view/ProfessionProile.html";
    changeActiveTab(shareHelp);
  };
  viewBtn.onclick = () => {
    contentElement.src = "./view/Notification.html";
    notificationModal.classList.remove("show");
    changeActiveTab(notification);
  };
  emergencypost.onclick = () => {
    contentElement.src = "./view/EmergencyPost.html";
    changeActiveTab(emergencypost);
  };

  changeActiveTab(friends);

  userInfo = await getUserInfo();

  await userRelogin();

  renderUsername(userInfo.username);
  renderUserShareStatus(userInfo.shareStatus);
  getUserProfile(userInfo);
  getUnreadMessage();
  editProfileBtn.onclick = () => {
    getUserProfile(userInfo);
    editProfileModal.style.display = "block";
  };
  ConfirmtoEdit.disabled = !checkPhoneNumberLength();
  async function updateUserInfo(name, genderValue, phoneValue) {
    try {
      const response = await fetch("/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: name,
          gender: genderValue,
          phoneNumber: phoneValue,
        }),
      });

      const data = await response.json();

      if (response.ok) {
      } else {
        console.error("Update failed:", data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }
  async function updateUserProfile(userId, jobType, messageContent) {
    const url = "userProfiles/currentUser";
    const payload = {
      user_id: userId,
      jobType: jobType,
      messageContent: messageContent,
    };

    try {
      const response = await fetch(url, {
        method: "PUT", // PUT method for updating data
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload), // convert the JavaScript object to a JSON string
      });

      if (!response.ok) {
        // If the response is not 2xx, throw an error
        throw new Error(
          `Failed to update profile: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.text(); // Assuming the server responds with JSON-formatted data
      return data; // Return the response data
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  }

  

  ConfirmtoEdit.addEventListener("click", async function () {
    event.preventDefault();
    let name = userInfo.username;
    let id = userInfo.userId;

    let genderText = genderDisplay.textContent;

    let genderValue = 0;
    switch (genderText) {
      case "Other":
        genderValue = 0;
        break;
      case "Male":
        genderValue = 1;
        break;
      case "Female":
        genderValue = 2;
        break;
    }
    let phoneValue = phone.value;
    let messageValue = message.value;

    let jobTypeText = jobType.textContent;
    let jobTypeValue = Object.keys(jobTypelist).find(
      (key) => jobTypelist[key] === jobTypeText
    );

    jobTypeValue = Number(jobTypeValue);

    updateUserInfo(name, genderValue, phoneValue);
    updateUserProfile(id, jobTypeValue, messageValue);

    editProfileModal.style.display = "none";
  });

  const genderOptions = document.querySelectorAll(".gender-option");

  genderOptions.forEach((option) => {
    option.addEventListener("click", function () {
      genderOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");
    });
  });
});

async function userRelogin() {
  fetch("/users/online", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: userInfo.username,
      isRelogin: true,
    }),
  }).then((response) => {
    if (response.status === 200) {
      return response.json();
    } else {
      displayAlert("reload user login failed");
    }
  });
}
window.addEventListener("unload", function (event) {
  if (!document.cookie.startsWith("token=")) {
    fetch("/users/currentUser/offline", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
});

window.addEventListener("unload", function (event) {
  if (!document.cookie.startsWith("token=")) {
    fetch("/users/currentUser/offline", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
});
