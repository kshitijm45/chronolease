const enterButton = document.getElementById("enter");
const errorMessage = document.querySelector(".errormsg");
const customerBtn = document.getElementById("customerbtn");
const employeeBtn = document.getElementById("employeebtn");
const signup = document.getElementById("signuptext");

customerBtn.addEventListener("click", function () {
  this.classList.remove("disable");
  employeeBtn.classList.add("disable");
});

signup.addEventListener("click", () => {
  window.location.href = "../signup/signup.html";
});

employeeBtn.addEventListener("click", function () {
  this.classList.remove("disable");
  customerBtn.classList.add("disable");
});

enterButton.addEventListener("click", async function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const type = customerBtn.classList.contains("disable")
    ? "employee"
    : "customer";

  try {
    const response = await fetch("/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, type }),
    });

    if (!response.ok) {
      throw new Error("Invalid username or password.");
    }

    const data = await response.json();
    const { redirectUrl } = data;

    // Redirect to the appropriate page
    window.location.href = redirectUrl;
  } catch (error) {
    errorMessage.style.display = "block";
    console.error("Error:", error);
  }
});
