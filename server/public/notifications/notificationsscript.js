const notificationsContainer = document.querySelector(".container");
const unreadNotificationsCountElement = document.querySelector("h2");

const watches = document.getElementById("nav-watches");
const profile = document.getElementById("nav-profile");
const payments = document.getElementById("nav-payments");
const logout = document.getElementById("nav-logout");
const urlParams = new URLSearchParams(window.location.search);
const username = urlParams.get("username");

watches.addEventListener("click", () => {
  window.location.href = `../watches/watches.html?username=${username}`;
});

profile.addEventListener("click", () => {
  window.location.href = `../profile/profile.html?username=${username}`;
});

payments.addEventListener("click", () => {
  window.location.href = `../payments/payments.html?username=${username}`;
});

logout.addEventListener("click", () => {
  window.location.href = "../index.html";
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch(`/notifications?username=${username}`);
    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }
    const data = await response.json();
    console.log("Notifications data:", data);
    displayUnreadCount(data.unreadCount);
    displayNotifications(data.notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
});

function displayUnreadCount(unreadCount) {
  const unreadCountElement = document.getElementById("unread-count");
  if (unreadCountElement) {
    unreadCountElement.textContent = `You have ${unreadCount} unread notifications`;
  } else {
    console.error("Unread count element not found");
  }
}

function displayNotifications(notifications) {
  const container = document.querySelector(".container");
  container.innerHTML = ""; // Clear existing content
  notifications.forEach((notification) => {
    const notificationElement = createNotificationElement(notification);
    container.appendChild(notificationElement);
  });
}

function createNotificationElement(notification) {
  const notificationElement = document.createElement("div");
  notificationElement.classList.add("notification");
  notificationElement.id = `notification-${notification.notification_id}`; // Set ID
  const message = document.createElement("p");
  message.textContent = notification.message;
  const date = document.createElement("h5");
  date.textContent = formatDate(notification.notification_date);

  notificationElement.appendChild(message);
  notificationElement.appendChild(date);

  // Create the "Mark as Read" button and conditionally display it
  const markAsReadButton = document.createElement("button");
  markAsReadButton.textContent = "Mark as Read";
  markAsReadButton.type = "button";
  if (!notification.is_read) {
    markAsReadButton.addEventListener("click", async () => {
      try {
        const response = await fetch(
          `/notifications/${notification.notification_id}/markAsRead`,
          {
            method: "PUT",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to mark notification as read");
        }
        // Reload the page after marking the notification as read
        window.location.reload();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    });
    notificationElement.appendChild(markAsReadButton);
  } else {
    markAsReadButton.style.display = "none"; // Hide the button if notification is read
  }

  return notificationElement;
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, options);
}
