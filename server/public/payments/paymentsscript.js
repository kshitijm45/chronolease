const watches = document.getElementById("nav-watches");
const profile = document.getElementById("nav-profile");
const notifications = document.getElementById("nav-notifications");
const logout = document.getElementById("nav-logout");
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");

watches.addEventListener("click", () => {
  window.location.href = `../watches/watches.html?username=${username}`;
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

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(`/payments?username=${username}`);
    if (!response.ok) {
      throw new Error("Failed to fetch payments");
    }
    const payments = await response.json();
    displayPayments(payments);
    setupPaymentButtons();
  } catch (error) {
    console.error("Error fetching payments:", error);
  }
});

function setupPaymentButtons() {
  const payNowButtons = document.querySelectorAll(".paynow");
  payNowButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const paymentId = button.id;
      try {
        const response = await fetch(`/payments/${paymentId}/pay`, {
          method: "PUT",
        });
        if (!response.ok) {
          throw new Error("Failed to update payment status");
        }
        button.classList.remove("paynow");
        button.classList.add("paid");
        button.textContent = "Paid";
        window.location.reload();
      } catch (error) {
        console.error("Error updating payment status:", error);
      }
    });
  });
}

function displayPayments(payments) {
  const container = document.querySelector(".container");
  container.innerHTML = ""; // Clear existing content
  payments.forEach((payment) => {
    const paymentElement = createPaymentElement(payment);
    container.appendChild(paymentElement);
  });
}

function formatDate(date) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(date).toLocaleDateString(undefined, options);
}

function createPaymentElement(payment) {
  const paymentElement = document.createElement("div");
  paymentElement.classList.add("payment");
  const desc = document.createElement("div");
  desc.classList.add("desc");
  desc.innerHTML = `
  <h4>${payment.watch_model}</h4>
  <h5>Amount due: $${payment.amount}</h5>
  <h5>Due Date: ${formatDate(payment.rental_end_date)}</h5>
  <h5>Payment Status: ${payment.payment_status}</h5>
  <button type="button" class="${
    payment.payment_status === "Paid" ? "paid" : "paynow"
  }" id="${payment.payment_id}">${
    payment.payment_status === "Paid" ? "Paid" : "Pay Now"
  }</button>
`;
  paymentElement.appendChild(desc);
  return paymentElement;
}
