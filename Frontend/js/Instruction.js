const btn = document.getElementById("btn");
const page1 = document.getElementById("page1");
const page2 = document.getElementById("page2");
const defaultCheck = document.getElementById("defaultCheck1");
const continueButton = document.getElementById("continue");
const user = {};

btn.onclick = () => {
  page1.style.transform = "translateX(-100%)";
  page2.style.transform = "translateX(0)";
  page1.style.display = "none";
  btn.style.display = "none";
};
defaultCheck.addEventListener("change", function () {
  if (this.checked) {
    continueButton.removeAttribute("disabled");
  } else {
    continueButton.setAttribute("disabled", "disabled");
  }
});
continueButton.onclick = () => {
  updateUserAcknowledgeStatus();
};
const updateUserStatus=(updateUserStatusURL)=>{
  fetch(updateUserStatusURL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => {
      if (res.status === 200) {
        window.location.href = `${ROUTER_PREFIX}/dashboard`;
      } else {
        alert("Updating user acknowledge error!");
      }
    })
    .catch((error) => {
      console.error(
        "Error during updating user acknowledge status:",
        error
      );
    });

}
function updateUserAcknowledgeStatus() {
  fetch("/users/currentUser/info", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((result) => result.json())
    .then((response) => {
      let username = response.username;
      let updateUserStatusURL = `/users/currentUser/acknowledgeStatus`;
      updateUserStatus(updateUserStatusURL)})

}


