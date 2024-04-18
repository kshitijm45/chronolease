const watches = document.getElementById("nav-watches");
const watchhistory = document.getElementById("nav-watchhistory");
const notifications = document.getElementById("nav-notifications");
const logout = document.getElementById("nav-logout");
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");
const profile = document.getElementById("nav-profile");
const dropdowns = document.querySelectorAll(".dropdown");
const addmodal = document.getElementById("modal");
const modalclose = document.getElementById("close-modal");
const addwatch = document.getElementById("add-btn");

modalclose.addEventListener("click", () => {
  addmodal.close();
});

addwatch.addEventListener("click", () => {
  addmodal.showModal();
});

watchhistory.addEventListener("click", () => {
  window.location.href = `../watchhistory/watchhistory.html?username=${username}`;
});

logout.addEventListener("click", () => {
  window.location.href = "../index.html";
});

profile.addEventListener("click", () => {
  window.location.href = `../employeeprofile/employeeprofile.html?username=${username}`;
});

dropdowns.forEach((dropdown) => {
  const select = dropdown.querySelector(".select");
  const caret = dropdown.querySelector(".caret");
  const menu = dropdown.querySelector(".menu");
  const options = dropdown.querySelectorAll(".menu li");
  const selected = dropdown.querySelector(".selected");

  select.addEventListener("click", () => {
    select.classList.toggle("select-clicked");
    caret.classList.toggle("caret-rotate");
    menu.classList.toggle("menu-open");
  });

  options.forEach((option) => {
    option.addEventListener("click", () => {
      selected.innerText = option.innerText;
      select.classList.remove("select-clicked");
      caret.classList.remove("caret-rotate");
      menu.classList.remove("menu-open");
      options.forEach((opt) => {
        opt.classList.remove("active");
      });
      option.classList.add("active");
    });
  });
});

// Client-side code to fetch watch details and display them
window.addEventListener("DOMContentLoaded", async () => {
  console.log("DOM content loaded");
  // Inside your fetch success block or wherever appropriate
  try {
    const response = await fetch("/watches");
    const watches = await response.json();
    displayWatches(watches);
  } catch (error) {
    console.error("Error fetching watch details:", error.message);
  }

  // Fetch brand names from the server and populate the dropdown
  fetchAndPopulateDropdown("/brands", "#brands");

  // Fetch category names from the server and populate the dropdown
  fetchAndPopulateDropdown("/categories", "#categories");

  const searchForm = document.querySelector("form");
  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const input = document.querySelector('input[type="text"]').value;
    const brand = document.querySelector("#brands .selected").textContent;
    const category = document.querySelector(
      "#categories .selected"
    ).textContent;

    const queryParams = new URLSearchParams({
      input: input || "",
      brand: brand || "Any",
      category: category || "Any",
    });

    try {
      const response = await fetch(`/search?${queryParams}`);
      const watches = await response.json();
      displayWatches(watches);
    } catch (error) {
      console.error("Error fetching search results:", error.message);
    }
  });
});

const dashboard = document.querySelector(".dashboard");
dashboard.addEventListener("click", async (event) => {
  if (
    event.target.tagName === "BUTTON" &&
    event.target.innerText === "Delete"
  ) {
    const watchId = event.target.id;
    try {
      const response = await fetch(`/watches/${watchId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        event.target.closest(".item").remove();
        console.log("Watch deleted successfully");
      } else {
        console.error("Failed to delete watch:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting watch:", error.message);
    }
  }
});

function displayWatches(watches) {
  const dashboard = document.querySelector(".dashboard");
  dashboard.innerHTML = ""; // Clear previous watches
  watches.forEach((watch) => {
    // Create watch item elements
    const item = document.createElement("div");
    item.classList.add("item");

    const img = document.createElement("img");
    img.classList.add("item-img");
    img.src = "../assets/images/watchdashboard2.jpg";

    const desc = document.createElement("div");
    desc.classList.add("desc");

    const brand = document.createElement("span");
    brand.innerText = watch.brand_name;

    const model = document.createElement("h5");
    model.innerText = watch.model;

    const category = document.createElement("h4");
    category.innerText = watch.category_name;

    const price = document.createElement("h4");
    price.innerText = `$${watch.price_per_day}`;

    const availability = document.createElement("p");
    availability.classList.add(
      watch.availability === "available" ? "available" : "notavailable"
    );
    availability.innerText = watch.availability;

    const rentBtn = document.createElement("button");
    rentBtn.setAttribute("id", watch.watch_id);
    rentBtn.innerText = "Delete";

    desc.appendChild(brand);
    desc.appendChild(model);
    desc.appendChild(category);
    desc.appendChild(price);
    desc.appendChild(availability);
    desc.appendChild(rentBtn);

    item.appendChild(img);
    item.appendChild(desc);

    dashboard.appendChild(item);
  });
}

async function fetchAndPopulateDropdown(endpoint, dropdownId) {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    const dropdown = document.querySelector(dropdownId);
    const menu = dropdown.querySelector(".menu");
    data.forEach((item) => {
      const option = document.createElement("li");
      option.textContent = item;
      option.addEventListener("click", () => selectOption(option, menu));
      menu.appendChild(option);
    });
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
  }
}

function selectOption(selectedOption, menu) {
  const options = menu.querySelectorAll("li");
  options.forEach((option) => option.classList.remove("active"));
  selectedOption.classList.add("active");
  const dropdown = selectedOption.closest(".dropdown");
  const selected = dropdown.querySelector(".selected");
  selected.textContent = selectedOption.textContent;
  menu.classList.remove("menu-open");
  options.forEach((option) => {
    option.removeEventListener("click", handleOptionClick);
    option.addEventListener("click", handleOptionClick);
  });
}

const addModal = document.getElementById("modal");
const addWatchButton = document.getElementById("add-btn");
console.log(addModal); // Check if addModal is correctly selected
console.log(addWatchButton);

addWatchButton.addEventListener("click", () => {
  addModal.showModal();
});
document.addEventListener("DOMContentLoaded", () => {
  const addModal = document.getElementById("modal");
  const addWatchButton = document.getElementById("add-btn");

  addWatchButton.addEventListener("click", () => {
    addModal.showModal();
  });

  const addWatchForm = document.querySelector("#modal form");
  const addButton = addWatchForm.querySelector("button[type='button']");

  addButton.addEventListener("click", async (event) => {
    event.preventDefault();

    const brand = addWatchForm.querySelector('input[name="brand"]').value;
    const model = addWatchForm.querySelector('input[name="model"]').value;
    const price_per_day = addWatchForm.querySelector(
      'input[name="price_per_day"]'
    ).value;
    const category = addWatchForm.querySelector('input[name="category"]').value;

    try {
      const response = await fetch("/watchesinsert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brand, model, price_per_day, category }),
      });
      if (response.ok) {
        addModal.close();
        location.reload(); // Reload the page to reflect changes
      } else {
        console.error("Failed to add watch:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding watch:", error.message);
    }
  });
});
