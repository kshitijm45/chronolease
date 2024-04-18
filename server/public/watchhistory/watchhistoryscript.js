const watches = document.getElementById("nav-watches");
const profile = document.getElementById("nav-profile");
const logout = document.getElementById("nav-logout");
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");

watches.addEventListener("click", () => {
  window.location.href = `../employeedashboard/employeedashboard.html?username=${username}`;
});

logout.addEventListener("click", () => {
  window.location.href = "../index.html";
});

profile.addEventListener("click", () => {
  window.location.href = `../employeeprofile/employeeprofile.html?username=${username}`;
});

document.addEventListener("DOMContentLoaded", () => {
  const searchButton = document.querySelector("button");
  searchButton.addEventListener("click", async () => {
    const watchId = document.getElementById("watchidfield").value;

    try {
      const response = await fetch("/watchhistory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ watchId }), // Corrected to watchId
      });
      const { watchName, rentalHistory } = await response.json(); // Include watchName in response

      // Display the watch name and rental history in the HTML
      displayRentalHistory(watchName, rentalHistory);
    } catch (error) {
      console.error("Error fetching rental history:", error.message);
    }
  });
});

function displayRentalHistory(watchName, rentalHistory) {
  const details = document.querySelector(".details");

  // Display watch name
  const watchNameElement = document.createElement("h4");
  watchNameElement.innerText = watchName;
  details.appendChild(watchNameElement);
  const dashboardDiv = document.createElement("div");
  details.appendChild(dashboardDiv);

  rentalHistory.forEach((rental) => {
    const rentalDiv = document.createElement("div");
    rentalDiv.classList.add("rental");

    const customerName = document.createElement("h3");
    customerName.innerText = rental.customer_name;

    const rentalId = document.createElement("p");
    rentalId.innerText = `Rental Id: ${rental.rental_id}`;

    const startDate = document.createElement("p");
    startDate.innerText = `Rental Start Date: ${rental.formatted_start_date}`;

    const endDate = document.createElement("p");
    endDate.innerText = `Rental End Date: ${rental.formatted_end_date}`;

    const rentalStatus = document.createElement("p");
    rentalStatus.innerText = `Rental Status: ${rental.rental_status}`;

    rentalDiv.appendChild(customerName);
    rentalDiv.appendChild(rentalId);
    rentalDiv.appendChild(startDate);
    rentalDiv.appendChild(endDate);
    rentalDiv.appendChild(rentalStatus);

    dashboardDiv.appendChild(rentalDiv);
  });
}
