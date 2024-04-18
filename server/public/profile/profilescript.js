const watches = document.getElementById("nav-watches");
const payments = document.getElementById("nav-payments");
const notifications = document.getElementById("nav-notifications");
const logout = document.getElementById("nav-logout");
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");

watches.addEventListener("click", () => {
  window.location.href = `../watches/watches.html?username=${username}`;
});

payments.addEventListener("click", () => {
  window.location.href = `../payments/payments.html?username=${username}`;
});

notifications.addEventListener("click", () => {
  window.location.href = `../notifications/notifications.html?username=${username}`;
});

logout.addEventListener("click", () => {
  window.location.href = "../index.html";
});

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Fetching customer profile for username:", username);
  try {
    const response = await fetch(`/customer/profile/${username}`);
    console.log("Response received:", response);
    if (!response.ok) {
      throw new Error("Failed to fetch customer profile");
    }
    const customerProfile = await response.json();
    console.log("Customer Profile:", customerProfile);
    // Assuming the response JSON contains the customer profile data directly
    displayCustomerProfile(customerProfile);
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    console.log("Error occurred during fetch:", error);
  }
});

function displayCustomerProfile(customerProfile) {
  document.getElementById("name").textContent = customerProfile.name;
  document.getElementById("username").textContent = customerProfile.username;
  document.getElementById("email").textContent = customerProfile.email;
  document.getElementById("address").textContent = customerProfile.address;
  document.getElementById("phone").textContent = customerProfile.phone_number;
}
