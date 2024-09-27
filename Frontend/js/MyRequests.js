const myRequestContainer = document.getElementById("my-requests-container");
const contentElement = window.parent.document.getElementById("mainContent");
const backBtn = document.getElementById("back-btn");
const backLink = document.getElementById("back-link");

let requests = [];

function displayRequestListWithStatus(requests) {
  if (requests.length == 0) {
    myRequestContainer.innerHTML = "no requests yet";
  } else {
    requests.forEach((request) => {
      const resource = request.resource;
      const card = document.createElement("div");
      card.className = "card mb-3";
      card.setAttribute("data-resource-id", request.id);

      let cardActionBtnContent = "";
      if (RESOURCE_REQUEST_STATUS.SENT === request.status) {
        cardActionBtnContent = `<button class="btn content-primary-btn">close</button>`;
      } else {
        cardActionBtnContent = `${
          RESOURCE_REQUEST_STATUS_OPTION[request.status].value
        }`;
      }
      card.innerHTML = `
    <div class="card-header">
      ${resource.title}
      <span class="float-right badge badge-light card-tag"> <i class="fa-solid fa-tag"></i> ${
        RESOURCE_TYPE_OPTION[resource.type].value
      }</span>
    </div>
    <div class="card-body">
      <p class="card-text">${resource.content}</p> <hr>
      <p class="card-text">Provider: ${resource.username}<br>Request Amount: ${
        request.amount
      }</p>
      <p class="card-text card-bottom">${
        resource.amount - resource.approved_request
      } Left
      <span class = "card-action-btn">${cardActionBtnContent}</span>
      </p>
    </div>
  `;

      myRequestContainer.appendChild(card);

      if (RESOURCE_REQUEST_STATUS.SENT === request.status) {
        const requestBtn = card.querySelector(".card-action-btn");
        requestBtn.addEventListener("click", async function (event) {
          const btn = event.currentTarget;
          const card = btn.closest(".card");
          const requestId = card.getAttribute("data-resource-id");

          let changeRequestStatusToCloseURL = `/resourceRequests/${requestId}/status/${RESOURCE_REQUEST_STATUS.CLOSED}`;
          try {
            let response = await fetch(changeRequestStatusToCloseURL, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
            });
            if (response.ok) {
              const cardActionBtnContainer = btn.parentElement;
              cardActionBtnContainer.innerHTML = `${
                RESOURCE_REQUEST_STATUS_OPTION[RESOURCE_REQUEST_STATUS.CLOSED]
                  .value
              }`;
            } else {
              throw new Error("Failed to update request status.");
            }
          } catch (error) {
            console.error("Error:", error);
          }
        });
      }
    });
  }
}

async function getMyRequestList() {
  let getCurrentUserRequestsURL = "/resourceRequests/currentUser";
  try {
    let response = await fetch(getCurrentUserRequestsURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let requests = await response.json();
    return requests;
  } catch (error) {
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  // userInfo = await getUserInfo();
  requests = await getMyRequestList();
  displayRequestListWithStatus(requests);

  backBtn.addEventListener("click", function () {
    contentElement.src = "./view/Resource.html";
  });

  backLink.addEventListener("click", function () {
    contentElement.src = "./view/Resource.html";
  });
});
