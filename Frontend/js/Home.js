const joinButton = document.getElementById("join");
const registerConfirmationButton = document.getElementById("register-confirm");
const nameInput = document.getElementById("nameInput");
const pwInput = document.getElementById("pwInput");
const alertDisplayElement = document.getElementById("alert-display");

const socket = io("");

function userLogin(userInfo) {
  fetch("/users/online", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: userInfo.username,
      passwordHash: userInfo.password_hash,
      isRelogin: false,
    }),
  })
    .then((response) => {
      if (response.status === 200) {
        return response.json();
      }else if (response.status === 403){
        alert('user is inactive')
      }
      else {
        alert("login failed");
      }
    })
    .then((userData) => {
      if (userData.acknowledge_status === 0) {
        //not acknowledged
        window.location.href = `${ROUTER_PREFIX}/instructions`;
        return;
      } else {
        window.location.href = `${ROUTER_PREFIX}/dashboard`;
        return;
      }
    });
}

async function checkUserRegistrationLegality(usernameValue, passwordValue) {


  const userInfoData = await getExistingUser(usernameValue);
  let userInfo = userInfoData.data;
  if (userInfo == null) {
    //user not exist
    hideAlert();
    $("#register-confirmation-modal").modal("show");
    return true;
  } else if (
    userInfo.password_hash === CryptoJS.MD5(passwordValue).toString()
  ) {
    //password correct
    hideAlert();
    userLogin(userInfo);
    return true;
  }
  return false;
}
//Join
joinButton.addEventListener("click", async function () {
  const usernameValue = nameInput.value;
  const passwordValue = pwInput.value;

  if (isValidateUsername(usernameValue) && isValidatePassword(passwordValue)) {
    if (!checkUserRegistrationLegality(usernameValue, passwordValue)) {
      //password incorrect
      displayAlert("Password incorrect. Please reset username/password.");
    }
  }
});



function displayAlert(message) {
  alertDisplayElement.innerHTML = message;
  alertDisplayElement.style.display = "block";
}

function hideAlert() {
  alertDisplayElement.style.display = "none";
}

registerConfirmationButton.addEventListener("click", () => {
  const usernameValue = nameInput.value;
  const passwordValue = pwInput.value;
  fetch("/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: usernameValue.toLowerCase(),
      passwordHash: CryptoJS.MD5(passwordValue).toString(),
    }),
  })
    .then((res) => {
      if (res.status != 201) {
        alert("Creating user failed!");
        location.reload();
        return res.json();
      } else {
        window.location.href = `${ROUTER_PREFIX}/instructions`;
        return res.json();
      }
    })
    .catch((error) => {
      console.error("Error during registration:", error);
    });
});

function addNewUserToDirectory() {
  fetch("/directories/currentUser", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
