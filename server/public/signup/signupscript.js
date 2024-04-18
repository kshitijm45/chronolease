let signupbtn = document.getElementById("signintext");
const enterButton = document.getElementById("enter");

signupbtn.addEventListener("click", function () {
  window.location.href = "../signin/signin.html";
});

// Add event listener to the "Enter" button
// Add event listener to the "Enter" button
enterButton.addEventListener("click", async () => {
  // Extract input values
  const name = document.querySelector('input[placeholder="Name"]').value;
  const email = document.querySelector('input[placeholder="Email"]').value;
  const address = document.querySelector('input[placeholder="Address"]').value;
  const phoneNumber = document.querySelector(
    'input[placeholder="Phone Number"]'
  ).value;
  const username = document.querySelector(
    'input[placeholder="Username"]'
  ).value;
  const password = document.querySelector(
    'input[placeholder="Password"]'
  ).value;

  // Check if any of the fields are empty
  if (!name || !email || !address || !phoneNumber || !username || !password) {
    // Show error message
    const errorMessage = document.getElementById("errormsg");
    errorMessage.innerHTML = "Enter Valid Details";
    return; // Prevent further execution of the function
  }

  if (!/^\d{10}$/.test(phoneNumber)) {
    // Show error message
    const errorMessage = document.getElementById("errormsg");
    errorMessage.innerHTML = "Enter a valid 10-digit phone number";
    return; // Prevent further execution of the function
  }

  // Check email format
  if (!/\S+@\S+\.\S+/.test(email)) {
    // Show error message
    const errorMessage = document.getElementById("errormsg");
    errorMessage.innerHTML = "Enter a valid email address";
    return; // Prevent further execution of the function
  }

  // Create an object with the user data
  const userData = {
    name,
    email,
    address,
    phone_number: phoneNumber,
    username,
    password,
  };

  // Check if userData is correctly formed

  try {
    // Send a POST request to your server with the user data using fetch API
    const response = await fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    // Check if the request was successful
    if (response.ok) {
      // Handle success
      console.log("User signed up successfully!");
      // Redirect to watches.html page with username included in query parameters
      window.location.href = `../watches/watches.html?username=${username}`;
    } else {
      errormessage = document.getElementById("errormsg");
      errormessage.innerHTML = "Enter Valid Details";
      // Handle error
      console.error("Failed to sign up user:", response.statusText);
      // Show an error message to the user
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
});
