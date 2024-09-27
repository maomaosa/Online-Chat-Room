const loadingContainer = document.getElementById("loading-container");
const myResourceBtn = document.getElementById("my-resource-btn");
const myRequestBtn = document.getElementById("my-requeset-btn");
const shareResourceBtn = document.getElementById("share-resource-btn");
const providerInput = document.getElementById("provider");
const shareResourceModal = document.getElementById("share-resource-modal");
const requestResourceModal = document.getElementById("request-resource-modal");
const searchJS = document.getElementById("search-js");
const resourceContentContainer = document.getElementById(
  "resource-content-container"
);
const criteriaSelect = document.getElementById("criteria-select");
const categorySelect = document.getElementById("category-select");
const titleORContentInput = document.getElementById("title-or-content-input");
const distanceInput = document.getElementById("distance-input");
const deleteBtn = document.getElementById("delete-btn");
const searchBtn = document.getElementById("search-btn");
const categoryForm = document.getElementById("category");
const titleForm = document.getElementById("title");
const descriptionForm = document.getElementById("description");
const addressForm = document.getElementById("address-form");
const amountForm = document.getElementById("amount");
const confirmShareResourceBtn = document.getElementById(
  "confirm-share-resource-btn"
);
const contentElement = window.parent.document.getElementById("mainContent");

let userInfo = null;
let resources = [];
let totalCount = 0;
let currentUserPosition = [0, 0];
MAP_ACCESS_TOKEN =
  "pk.eyJ1IjoibWljaGVsbGUtemhvdSIsImEiOiJjbHVxZHRhcjcxeG8wMmhsbG9hcXdudTFnIn0.zkW-N8dR4eK4YcTSUalMYw";
mapboxgl.accessToken = MAP_ACCESS_TOKEN;
let geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
});
let map = null;
let shareResourceModalInstance = null;
let requestResourceModalInstance = null;

let shareResourceModalAddress = {};
let criterias = [];

async function displayResourceList(resources) {
  resourceContentContainer.innerHTML = "";
  resources.forEach(async (resource) => {
    let address = await coordinatesToAddress(
      MAP_ACCESS_TOKEN,
      resource.address.x,
      resource.address.y
    );
    const card = document.createElement("div");
    card.className = "card mb-3";
    card.setAttribute("data-resource-id", resource.id);

    let actionBtnContent = "";
    if (
      resource.user_id !== userInfo.userId &&
      resource.amount - resource.approved_request !== 0
    ) {
      actionBtnContent = `
        <span class="card-action-btn">
          <button class="btn content-btn resource-request-btn">Request</button>
        </span>`;
    }
    card.innerHTML = `
    <div class="card-header">
      ${resource.title}
      <span class="float-right badge badge-light card-tag"> <i class="fa-solid fa-tag"></i> ${
        RESOURCE_TYPE_OPTION[resource.type].value
      }</span>
      <span><i class="fa-solid fa-location-crosshairs nav-btn"></i></span>
    </div>
    <div class="card-body">
      <p class="card-text">${resource.content}</p> <hr>
      <p class="card-text basic-info">Provider: ${
        resource.username
      }<br>Address: ${address}</p>
      <p class="card-text card-bottom">${
        resource.amount - resource.approved_request
      } Left
      ${actionBtnContent}
      </p>
    </div>
  `;
    card.dataset.mapCoordinates = `${resource.address.x},${resource.address.y}`;

    displayAddressOnMap(resource.address);
    if (resource.user_id !== userInfo.userId) {
      const requestBtn = card.querySelector(".resource-request-btn");
      requestBtn.addEventListener("click", function (event) {
        const card = event.target.closest(".card");
        displayRequestForm(card);
      });
    }

    const navBtn = card.querySelector(".nav-btn");
    navBtn.addEventListener("click", function (event) {
      const card = event.target.closest(".card");
      const coords = card.dataset.mapCoordinates.split(",").map(Number);
      map.flyTo({
        center: coords,
        essential: true,
      });
    });

    resourceContentContainer.appendChild(card);
  });
}

function displayRequestForm(card) {
  const header = card
    .querySelector(".card-header")
    .textContent.trim()
    .split(/\s+/);
  header.pop();
  const title = header.join(" ");
  let basicInfoText = card.querySelector(".basic-info").textContent;
  const splitInfo = basicInfoText.split("Address: ");
  const address = splitInfo[1].trim();
  const provider = splitInfo[0].replace("Provider: ", "").trim();
  const amountLeftText = card.querySelector(
    ".card-text.card-bottom"
  ).textContent;
  const amountLeft = amountLeftText.split(" ")[0];
  const resourceId = card.dataset.resourceId;

  let requestTitle = document.getElementById("request-title");
  let requestProviderInput = document.getElementById("request-provider");
  let requestAddressInput = document.getElementById("request-address");
  let requestNumberAvailableInput = document.getElementById(
    "request-numberAvailable"
  );
  let requestRequesterInput = document.getElementById("request-requester");
  requestTitle.textContent = title;
  requestProviderInput.value = provider;
  requestAddressInput.value = address;
  requestNumberAvailableInput.value = amountLeft;
  requestRequesterInput.value = userInfo.username;
  requestResourceModal.setAttribute("request-resource-id", resourceId);
  const numberRequestInput = document.getElementById("request-numberRequest");
  numberRequestInput.max = amountLeft;
  bindRequestButtonEvent();
  requestResourceModalInstance.show();
}

function bindRequestButtonEvent() {
  const confirmRequestBtn = document.getElementById(
    "confirm-request-resource-btn"
  );
  confirmRequestBtn.removeEventListener("click", handleRequestButtonClick);
  confirmRequestBtn.addEventListener("click", handleRequestButtonClick);
}

async function handleRequestButtonClick() {
  let postRequestURL = "/resourceRequests";
  try {
    const requestData = {
      resourceId: requestResourceModal.getAttribute("request-resource-id"),
      amount: document.getElementById("request-numberRequest").value,
    };
    await fetch(postRequestURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });
    requestResourceModalInstance.hide();
    alert("Request sent successfully!");
  } catch (error) {
    console.error("Error:", error);
  }
}

function displayAddressOnMap(address) {
  new mapboxgl.Marker().setLngLat([address.x, address.y]).addTo(map);
}

function deletePagination() {
  const paginationContainer = document
    .getElementById("resouce-navigation")
    .getElementsByTagName("ul")[0];
  paginationContainer.innerHTML = "";
}
function createPagination(currentPage) {
  const paginationContainer = document
    .getElementById("resouce-navigation")
    .getElementsByTagName("ul")[0];
  let li = document.createElement("li");
  li.className = "page-item";
  li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${
    currentPage - 1
  })">prev</a>`;
  li.classList.toggle("disabled", currentPage === 1);
  paginationContainer.appendChild(li);

  const pageCount = Math.ceil(totalCount / 5);
  for (let i = 1; i <= pageCount; i++) {
    let li = document.createElement("li");
    li.className = "page-item";
    li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${i})">${i}</a>`;
    if (i === currentPage) {
      li.classList.add("active");
    }
    paginationContainer.appendChild(li);
  }

  li = document.createElement("li");
  li.className = "page-item";
  li.innerHTML = `<a class="page-link" href="#" onclick="changePage(${
    currentPage + 1
  })">next</a>`;
  li.classList.toggle("disabled", currentPage === pageCount);
  paginationContainer.appendChild(li);
}

async function changePage(pageNumber) {
  resources = await getResourceList(pageNumber);
  displayResourceList(resources);
  deletePagination();
  createPagination(pageNumber);
}

async function getResourceList(pageNumber) {
  let getResourceListURL = `/resources/?page=${pageNumber}`;
  if (criterias.length != 0) {
    for (let criteria of criterias) {
      getResourceListURL =
        getResourceListURL +
        `&${criteria["criteria"]}=${criteria["criteriaValue"]}`;
      if (criteria["criteria"] === "distance") {
        getResourceListURL =
          getResourceListURL + `&userLocation=${currentUserPosition}`;
      }
    }
  }

  try {
    let response = await fetch(getResourceListURL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let resourceData = await response.json();
    totalCount = resourceData["totalCount"];
    return resourceData["data"];
  } catch (error) {
    console.error("Error:", error);
  }
}

function showLoading() {
  loadingContainer.style.display = "flex";
}

function hideLoading() {
  loadingContainer.style.display = "none";
}

document.addEventListener("DOMContentLoaded", async function () {
  showLoading();
  userInfo = await getUserInfo();
  resources = await getResourceList(1);
  let position = await getUserLocation();
  currentUserPosition = [position.coords.longitude, position.coords.latitude];

  map = new mapboxgl.Map({
    container: "map-container",
    style: "mapbox://styles/mapbox/outdoors-v11",
    projection: "globe",
    zoom: 15,
    center: currentUserPosition,
  });

  map.on("load", () => {
    map.setFog({});
  });

  if (resources.length > 0) {
    await displayResourceList(resources);
    createPagination(1);
  } else {
    resourceContentContainer.innerHTML = "No resources";
  }

  hideLoading();

  shareResourceModalInstance = new bootstrap.Modal(shareResourceModal);

  shareResourceBtn.addEventListener("click", function () {
    let providerInput = document.getElementById("share-provider");
    providerInput.value = userInfo.username;
    shareResourceModalInstance.show();
  });

  requestResourceModalInstance = new bootstrap.Modal(requestResourceModal);

  geocoder.on("result", function (e) {
    const longitude = e.result.geometry.coordinates[0];
    const latitude = e.result.geometry.coordinates[1];
    shareResourceModalAddress = { longitude: longitude, latitude: latitude };
  });

  confirmShareResourceBtn.addEventListener("click", async function () {
    const resourceData = {
      type: categoryForm.value,
      title: titleForm.value,
      content: descriptionForm.value,
      address: shareResourceModalAddress,
      amount: amountForm.value,
    };

    let postResourceURL = "/resources";
    try {
      let response = await fetch(postResourceURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resourceData),
      });
      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          console.error("Error 400: Bad request", errorData);
          alert(`Error: ${errorData.error}`);
        } else {
          console.error(`HTTP error: ${response.status}`);
          alert("An error occurred. Please try again later.");
        }
      } else {
        shareResourceModalInstance.hide();
        clearShareResourceFormData();
        alert("Resource shared successfully!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("A network error occurred. Please try again later.");
    }
  });

  myResourceBtn.addEventListener("click", function () {
    contentElement.src = "./view/MyResources.html";
  });

  myRequestBtn.addEventListener("click", function () {
    contentElement.src = "./view/MyRequests.html";
  });

  $("#share-resource-modal").on("shown.bs.modal", function () {
    addressForm.innerHTML = "";
    var geocoderContainer = document.createElement("div");
    geocoderContainer.id = "geocoder-container";

    geocoderContainer.appendChild(geocoder.onAdd());
    addressForm.appendChild(geocoderContainer);
  });

  searchJS.onload = () => {
    mapboxsearch.config.accessToken = MAP_ACCESS_TOKEN;

    autofillCollection = mapboxsearch.autofill({});
    autofillCollection.addEventListener("retrieve", async (e) => {
      expandForm();
    });
  };

  criteriaSelect.addEventListener("change", function () {
    const selectedValue = criteriaSelect.value;
    resetAllCriteriaValues();
    if (selectedValue === "1") {
      categorySelect.style.display = "block";
    } else if (selectedValue === "2" || selectedValue === "3") {
      titleORContentInput.style.display = "block";
    } else if (selectedValue === "4") {
      distanceInput.style.display = "block";
    }
  });

  deleteBtn.addEventListener("click", async function () {
    resetAllCriteria();

    criterias = [];
    resources = await getResourceList(1);
    deletePagination();
    if (resources.length > 0) {
      displayResourceList(resources);
      createPagination(1);
    } else {
      resourceContentContainer.innerHTML = "No resources";
    }
  });

  function resetAllCriteria() {
    criteriaSelect.selectedIndex = 0;
    resetAllCriteriaValues();
  }

  function resetAllCriteriaValues() {
    categorySelect.selectedIndex = 0;
    categorySelect.style.display = "none";
    titleORContentInput.value = "";
    titleORContentInput.style.display = "none";
    distanceInput.value = "";
    distanceInput.style.display = "none";
  }

  searchBtn.addEventListener("click", async function () {
    if (
      (criteriaSelect.value !== "Choose..." &&
        categorySelect.value !== "Choose...") ||
      titleORContentInput.value !== "" ||
      distanceInput.value !== ""
    ) {
      criterias = getCriterias();
      resources = await getResourceList(1);
      deletePagination();
      if (resources.length > 0) {
        displayResourceList(resources);
        createPagination(1);
      } else {
        resourceContentContainer.innerHTML = "No resources";
      }
    } else {
      alert("Search information missing.");
    }
  });
});

function getCriterias() {
  const optionStrings = {
    1: { criteria: "category", criteriaValue: categorySelect.value },
    2: { criteria: "title", criteriaValue: titleORContentInput.value },
    3: { criteria: "content", criteriaValue: titleORContentInput.value },
    4: { criteria: "distance", criteriaValue: distanceInput.value },
  };
  return [optionStrings[criteriaSelect.value]];
}

function clearShareResourceFormData() {
  categoryForm.value = "";
  titleForm.value = "";
  descriptionForm.value = "";
  shareResourceModalAddress.value = "";
  amountForm.value = "";
}



function validateIntegerInput(element) {
  let value = parseInt(element.value, 10);

  if (isNaN(value)) {
    value = element.min || 1;
  }

  element.value = value;
}

function validateIntegerInputWithMaxLimit(element) {
  validateIntegerInput(element);

  let value = parseInt(element.value, 10);
  if (value > element.max) {
    value = element.max;
  }
  element.value = value;
}
