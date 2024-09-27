const myResourceContainer = document.getElementById("my-resources-container");
const updateResourceModal = document.getElementById("update-resource-modal");
const backBtn = document.getElementById("back-btn");
const backLink = document.getElementById("back-link");
const contentElement = window.parent.document.getElementById("mainContent");

let resources = [];
let editResourceModalInstance = null;

MAP_ACCESS_TOKEN =
  "pk.eyJ1IjoibWljaGVsbGUtemhvdSIsImEiOiJjbHVxZHRhcjcxeG8wMmhsbG9hcXdudTFnIn0.zkW-N8dR4eK4YcTSUalMYw";

function displayResourceListWithRequests(resources) {
  if (resources.length == 0) {
    myResourceContainer.innerHTML = "no resources yet";
  } else {
    resources.forEach(async (resource) => {
      let address = await coordinatesToAddress(
        MAP_ACCESS_TOKEN,
        resource.address.x,
        resource.address.y
      );
      const approvedCount = resource.requests.filter(
        (request) => request.status === RESOURCE_REQUEST_STATUS.APPROVED
      ).length;
      const card = document.createElement("div");
      card.className = "card mb-3";
      card.setAttribute("data-resource-id", resource.id);

      card.innerHTML = `
        <div class="card-header">
          ${resource.title}
          <span class="float-right badge badge-light card-tag"> <i class="fa-solid fa-tag"></i> ${
            RESOURCE_TYPE_OPTION[resource.type].value
          }</span>
        </div>
        <div class="card-body">
          <p class="card-text">${resource.content}</p> <hr>
          <p class="card-text basic-info">Address: ${address}<br>Total:${
        resource.amount
      }</p>
          <p class="card-text card-bottom">
          <div class = "group-btn"><button class="btn content-btn delete-resource-btn">Delete</button> <button class="btn content-primary-btn edit-resource-btn">Edit</button></div>
          </p>
        </div>
      `;

      myResourceContainer.appendChild(card);

      const deleteBtn = card.querySelector(".delete-resource-btn");
      deleteBtn.addEventListener("click", async function (event) {
        const btn = event.currentTarget;
        const card = btn.closest(".card");
        const resourceId = card.getAttribute("data-resource-id");

        let deleteResourceURL = `/resources/${resourceId}`;
        try {
          let response = await fetch(deleteResourceURL, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          if (response.ok) {
            card.remove();
          } else {
            throw new Error("Failed to delete resource.");
          }
        } catch (error) {
          console.error("Error:", error);
        }
      });

      const editBtn = card.querySelector(".edit-resource-btn");
      editBtn.addEventListener("click", async function (event) {
        const card = event.target.closest(".card");
        displayEditForm(card);
      });

      displayRequestedUsers(resource.requests, card);
    });
  }
}

function displayEditForm(card) {
  const header = card
    .querySelector(".card-header")
    .textContent.trim()
    .split(/\s+/);
  header.pop();

  const typeElement = card.querySelector(".card-tag");
  let type = getTypeKey(typeElement.textContent.trim());
  const title = header.join(" ");
  let content = card.querySelector(".card-text").textContent;
  let basicInfoText = card.querySelector(".basic-info").textContent;
  const splitInfo = basicInfoText.split("Total:");
  const amount = splitInfo[1].trim();

  const resourceId = card.dataset.resourceId;

  document.getElementById("update-title").value = title;
  document.getElementById("update-description").value = content;
  document.getElementById("update-category").value = type;
  document.getElementById("update-amount").value = amount;
  document.getElementById("confirm-update-resource-btn").dataset.resourceId =
    resourceId;

  bindUpdateButtonEvent();

  editResourceModalInstance.show();
}

function bindUpdateButtonEvent() {
  const confirmUpdateBtn = document.getElementById(
    "confirm-update-resource-btn"
  );
  confirmUpdateBtn.removeEventListener("click", handleRequestButtonClick);
  confirmUpdateBtn.addEventListener("click", handleRequestButtonClick);
}

async function handleRequestButtonClick() {
  let updateResourceURL = "/resources";
  try {
    const resourceData = {
      id: document.getElementById("confirm-update-resource-btn").dataset
        .resourceId,
      type: document.getElementById("update-category").value,
      title: document.getElementById("update-title").value,
      content: document.getElementById("update-description").value,
      amount: document.getElementById("update-amount").value,
    };
    await fetch(updateResourceURL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resourceData),
    });
    editResourceModalInstance.hide();
    updateCardInfo();
    alert("Resource updated successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
}

function updateCardInfo() {
  const resourceId = document.getElementById("confirm-update-resource-btn")
    .dataset.resourceId;

  const card = document.querySelector(
    `.card[data-resource-id="${resourceId}"]`
  );

  if (!card) {
    console.error("Card with the given resource ID not found");
    return;
  }

  const type = document.getElementById("update-category").value;
  const title = document.getElementById("update-title").value;
  const content = document.getElementById("update-description").value;
  const amount = document.getElementById("update-amount").value;

  card.querySelector(".card-header").innerHTML = `${title} 
    <span class="float-right badge badge-light card-tag"> <i class="fa-solid fa-tag"></i> ${RESOURCE_TYPE_OPTION[type].value}</span>`;
  card.querySelector(".card-text").textContent = content;

  let basicInfoText = card.querySelector(".basic-info").textContent;
  basicInfoText = basicInfoText.replace(/Total:\d+/, `<br>Total:${amount}`);
  card.querySelector(".basic-info").innerHTML = basicInfoText;
}

function getTypeKey(typeValue) {
  const typeEntry = RESOURCE_TYPE_OPTION.find(
    (option) => option.value.toLowerCase() === typeValue.toLowerCase()
  );

  if (typeEntry) {
    return RESOURCE_TYPE_OPTION.indexOf(typeEntry);
  }
  return -1;
}

function displayRequestedUsers(requests, card) {
  if (requests.length > 0) {
    let table = document.createElement("table");
    table.className = "table";
    table.innerHTML = `
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Request Amount</th>
          <th scope="col" class="action-col"></th>
        </tr>
      </thead>
    `;
    let tableBody = document.createElement("tbody");
    requests.forEach((request) => {
      let row = document.createElement("tr");
      let lastColumnContent;
      if (request.status === RESOURCE_REQUEST_STATUS.SENT) {
        lastColumnContent = `
          <div class="group-btn" data-request-id="${request.id}">
            <button class="btn content-btn decline-btn" data-request-id="${request.id}">Decline</button>
            <button class="btn content-primary-btn approve-btn" data-request-id="${request.id}">Approve</button>
          </div>`;
      } else {
        lastColumnContent = `<span class="request-status" data-request-id="${
          request.id
        }">${RESOURCE_REQUEST_STATUS_OPTION[request.status].value}</span>`;
      }
      row.innerHTML = `
        <td>${request.username}</td>
        <td>${request.amount}</td>
        <td>${lastColumnContent}</td>
      `;
      tableBody.appendChild(row);

      row.querySelectorAll(".decline-btn, .approve-btn").forEach((button) => {
        button.addEventListener("click", function (event) {
          const requestId = button.getAttribute("data-request-id");
          if (button.classList.contains("decline-btn")) {
            changeRequestStatus(requestId, RESOURCE_REQUEST_STATUS.DECLINED);
          } else if (button.classList.contains("approve-btn")) {
            changeRequestStatus(requestId, RESOURCE_REQUEST_STATUS.APPROVED);
          }
        });
      });
    });
    table.appendChild(tableBody);
    card.appendChild(table);
  } else {
    let reminder = document.createElement("span");
    reminder.textContent = "Nobody requested yet";
    card.appendChild(reminder);
  }
}

async function changeRequestStatus(requestId, status) {
  let changeRequestStatusURL = `/resourceRequests/${requestId}/status/${status}`;

  try {
    let response = await fetch(changeRequestStatusURL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      const statusContainer = document.querySelector(
        `[data-request-id="${requestId}"]`
      );
      if (statusContainer) {
        statusContainer.innerHTML = `<span class="request-status">${RESOURCE_REQUEST_STATUS_OPTION[status].value}</span>`;
      }
    } else {
      throw new Error("Failed to update request status.");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function getMyResourceList() {
  let getCurrentUserResourcesURL = "/resources/currentUser";
  try {
    let response = await fetch(getCurrentUserResourcesURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let resourceData = await response.json();
    return resourceData;
  } catch (error) {
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  // userInfo = await getUserInfo();
  resources = await getMyResourceList();
  displayResourceListWithRequests(resources);

  backBtn.addEventListener("click", function () {
    contentElement.src = "./view/Resource.html";
  });

  backLink.addEventListener("click", function () {
    contentElement.src = "./view/Resource.html";
  });

  editResourceModalInstance = new bootstrap.Modal(updateResourceModal);
});

function validateUpdatedIntegerInput(element) {
  let value = parseInt(element.value, 10);

  if (isNaN(value)) {
    value = element.min || 1;
  }

  element.value = value;
}
