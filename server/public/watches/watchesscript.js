const dropdowns = document.querySelectorAll(".dropdown");
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");
const rentButtons = document.querySelectorAll(".desc button");
const rentmodal = document.getElementById("modal");
const modalclose = document.getElementById("close-modal");
const payments = document.getElementById("nav-payments");
const profile = document.getElementById("nav-profile");
const notifications = document.getElementById("nav-notifications");
const logout = document.getElementById("nav-logout");

modalclose.addEventListener("click", () => {
  rentmodal.close();
});

payments.addEventListener("click", () => {
  window.location.href = `../payments/payments.html?username=${username}`;
});

profile.addEventListener("click", () => {
  window.location.href = `../profile/profile.html?username=${username}`;
});

notifications.addEventListener("click", () => {
  window.location.href = `../notifications/notifications.html?username=${username}`;
});

logout.addEventListener("click", () => {
  window.location.href = "../index.html";
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
    rentBtn.innerText = "Rent";

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

function handleOptionClick(event) {
  const selectedOption = event.target;
  const menu = selectedOption.parentElement;
  selectOption(selectedOption, menu);
}

document.addEventListener("click", async function (event) {
  if (event.target.matches(".item button")) {
    event.preventDefault(); // Prevent default form submission behavior

    const watchId = event.target.id;

    // Fetch watch availability
    try {
      const response = await fetch(`/watch/${watchId}`);
      const watch = await response.json();

      if (watch.availability === "available") {
        // Watch is available, proceed to open modal
        rentmodal.showModal(); // Display the modal

        const rentNowBtn = document.querySelector("#modal button");
        const startDateInput = document.querySelector(
          "#modal input[type='date']"
        );
        const endDateInput = document.querySelectorAll(
          "#modal input[type='date']"
        )[1];
        const modalErrorMsg = document.getElementById("modalerrormsg");

        rentNowBtn.onclick = async () => {
          const startDate = startDateInput.value;
          const endDate = endDateInput.value;

          // Validate start date and end date
          const currentDate = new Date();
          const selectedStartDate = new Date(startDate);
          const selectedEndDate = new Date(endDate);

          if (selectedStartDate < currentDate) {
            modalErrorMsg.textContent = "Start date cannot be in the past";
          } else if (selectedEndDate <= selectedStartDate) {
            modalErrorMsg.textContent = "End date must be after start date";
          } else {
            const rentalData = {
              username: username, // Send the username to the server
              watch_id: watchId,
              rental_start_date: startDate,
              rental_end_date: endDate,
              rental_status: "Active", // Initial status
            };
            try {
              const response = await fetch("/rent", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(rentalData),
              });
              if (response.ok) {
                console.log("Rental request submitted successfully!");
                rentmodal.close();
                location.reload();
              } else {
                console.error(
                  "Failed to submit rental request:",
                  response.statusText
                );
              }
            } catch (error) {
              console.error("An error occurred:", error);
            }
          }
        };
      } else {
        // Watch is not available, display error message or take appropriate action
        console.log("This watch is not available for rent.");
      }
    } catch (error) {
      console.error(
        "An error occurred while fetching watch availability:",
        error
      );
    }
  }
});
