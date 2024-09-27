document.addEventListener("DOMContentLoaded", async function () {
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");
  const carouselItems = document.querySelectorAll(".carousel-item");

  let currentIndex = 0;
  leftBtn.addEventListener("click", function () {
    carouselItems[currentIndex].style.display = "none";
    currentIndex =
      (currentIndex - 1 + carouselItems.length) % carouselItems.length;
    carouselItems[currentIndex].style.display = "flex";
  });

  rightBtn.addEventListener("click", function () {
    carouselItems[currentIndex].style.display = "none";
    currentIndex = (currentIndex + 1) % carouselItems.length;
    carouselItems[currentIndex].style.display = "flex";
  });
  getProfilesByJobType(1);
  let currentUserIno = await getUserInfo();
  let currentUserName = currentUserIno.username;
  let myProfile = await getMyProfile(currentUserName);

  share_btn.onclick = () => {
    postMyProfileOnProfileWall(myProfile);
  };
});
let globalAppointments = [];

const closeSchdule = document.getElementsByClassName("close")[0];
const profileHistory = document.getElementById("profileHistory");
const share_btn = document.getElementById("share_btn");
const Psychologist = document.getElementById("Psychologist");
const jobTitles = document.querySelectorAll(".carousel-item div");
const Doctor = document.getElementById("Doctor");

function selectJobTitle(event) {
  jobTitles.forEach((jobTitle) => {
    jobTitle.classList.remove("selected");
  });
  event.currentTarget.classList.add("selected");
}
jobTitles.forEach((jobTitle) => {
  jobTitle.addEventListener("click", selectJobTitle);
});

const getProfilesByJobType = async (jobType) => {
  let url = `/userProfiles/jobType/${Number(jobType)}`;
  try {
    let respone = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let profileObject = await respone.json();
    let profileList = profileObject.profiles;
    let filteredProfiles = profileList.filter((profile) => profile.isposted);
    for (let i = 0; i < filteredProfiles.length; i++) {
      const currentMessage = filteredProfiles[i];
      displayProfile(
        currentMessage.user_id,
        currentMessage.username,
        currentMessage.job_type,
        currentMessage.message_content
      );
    }

    return profileList;
  } catch (error) {
    console.error("Error:", error);
  }
};
const getUserInfo = async () => {
  let getCurrentUserInfoURL = "/users/currentUser/info";
  try {
    let response = await fetch(getCurrentUserInfoURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let userInfo = await response.json();
    return userInfo;
  } catch (error) {
    console.error("Error:", error);
  }
};
async function getMyProfile(currentuser_name) {
  let url = `/userProfiles/${currentuser_name}`;
  try {
    let response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let userProfilewithuserInfo = await response.json();
    
    return userProfilewithuserInfo.data;
  } catch (error) {
    console.error("Error:", error);
  }
}

const postMyProfileOnProfileWall = async (profile) => {
  let url = `/userProfiles/currentUser`;
  try {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: profile.user_id,
        jobType: profile.job_type,
        messageContent: profile.message_content,
        isPosted: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    let data = await response.json();
    return data;
  } catch (error) {
    console.error("Error posting profile on profile wall", error);
  }
};
const updateMyProfile = async (profile) => {};
const displayProfile = async (user_id, username, jobType, messageContent) => {
  const currentUserInfo = await getUserInfo();
  const isCurrentUserProfile = currentUserInfo.userId === user_id;

  var profileHtml = `
  <div class="sticky-note" onclick="profileDetail('${user_id}','${username}', '${jobType}', '${messageContent}')">
    <div class="sticky-note-header">
      <span class="sticky-note-pin"></span>
    </div>
    <div class="sticky-note-content">
      <p>${messageContent}</p>
      <p><b>${username}</b></p>
  `;

  if (isCurrentUserProfile) {
    profileHtml += `
      <div class="sticky-note-icons">
        <i class="fa-solid fa-trash" onclick="deleteMyprofile('${currentUserInfo.userId}')"></i>
        <i class="fa-regular fa-calendar" onclick="schedule('${user_id}')"></i>
      </div>`;
  } else {
    profileHtml += `
      <i class="fa-regular fa-calendar" onclick="schedule('${user_id}')"></i>`;
  }

  profileHtml += `
    </div>
  </div>`;

  profileHistory.insertAdjacentHTML("beforeend", profileHtml);
};

async function deleteCurrentUserProfile(userId) {
  const url = "/userProfiles/currentUser";
  const requestOptions = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userId,
    }),
  };
  try {
    const response = await fetch(url, requestOptions);
    const data = await response.json();

    if (response.ok) {
    } else {
      throw new Error(
        `Failed to delete profile: ${response.status} ${response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
}
function deleteMyprofile(id) {
  $("#deleteConfirmationModal").modal("show");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  confirmDeleteBtn.onclick = function () {
    let idToNumber = Number(id);
    deleteCurrentUserProfile(idToNumber);
    $("#deleteConfirmationModal").modal("hide");
  };
}
const confirmDateButton = document.getElementById("confirmDate");
const dateInput = document.getElementById("dateInput");
function schedule(user_id) {
  let scheduleModal = document.getElementById("scheduleModal");
  scheduleModal.style.display = "block";

  confirmDateButton.addEventListener("click", async function () {
    let myprofileInfo = await getUserInfo();
    let inputDateValue = dateInput.value;

    let r2 = myprofileInfo.userId;
    try {
      const appointmentData = await scheduleAppointment(
        inputDateValue,
        user_id,
        r2
      );
      scheduleModal.style.display = "none";
    } catch (error) {
      console.error("Error scheduling appointment", error);
    }
  });
}

async function scheduleAppointment(time, r1, r2) {
  let url = `/userProfileAppointments`;
  try {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        time: time,
        receiver_id: r2,
        receivee_id: r1,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // updateButtonAfterShare();
    let data = await response.json();

    return data;
  } catch (error) {
    console.error("Error schedule", error);
  }
}
const jobTypes = {
  Doctor: 1,
  Dentist: 2,
  Psychologist: 4,
  Nurse: 3,
  Police: 5,
  FireFighter: 6,
};
Object.entries(jobTypes).forEach(([elementId, jobType]) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.onclick = () => {
      profileHistory.innerHTML = "";
      getProfilesByJobType(jobType);
    };
  }
});

closeSchdule.onclick = function () {
  var modal = document.getElementById("scheduleModal");
  modal.style.display = "none";
};
backToProfileWall.onclick=()=>{
  window.location.reload();
}
async function profileDetail(user_id, username, jobType, messageContent) {
  const carousel=document.getElementById('carousel')
  const backToProfileWall=document.getElementById('backToProfileWall')
  carousel.style.display='none'
  backToProfileWall.style.display='block'
  profileHistory.innerHTML = "";
  await displayProfile(user_id, username, jobType, messageContent);
  let myProfileData = await getMyProfile(username);
  globalAppointments = myProfileData.appointments;
  
  globalAppointments.forEach((appointment) => {
    
    if (appointment.appointment_id == null) {
      return;
    } else {
      displayAppointList(appointment);
    }
  });
}
function displayAppointList(appointment) {
  console.log(formatTimestamps(appointment.start_schedule_date,appointment.end_schedule_date))
  
  let appointListHTML = `
  <div class="appointment-container">
    <div class="appointment-header">
      <span>schedule_date</span>
    </div>
    ${formatTimestamps(appointment.start_schedule_date,appointment.end_schedule_date)}
  </div>
`;
  profileHistory.insertAdjacentHTML("beforeend", appointListHTML);
}

function formatTimestamps(startTimestamp, endTimestamp) {

  const startDate = new Date(startTimestamp * 1000);
  const endDate = new Date(endTimestamp * 1000);

  startDate.setHours(startDate.getHours() );
  endDate.setHours(endDate.getHours() );

  const formatTime = (date) => {
    return String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0');
  };

  const formatDate = (date) => {
    return date.getDate() + '/' + date.toLocaleString('en-us', { month: 'short' }) + '/' + date.getFullYear();
  };

  return formatTime(startDate) + '-' + formatTime(endDate) + ' ' + formatDate(startDate);

}


