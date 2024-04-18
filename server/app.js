const express = require("express");
const path = require("path");
const bodyParser = require("body-parser"); // Import body-parser middleware
const { Client } = require("pg");
const cron = require("node-cron");

const app = express();
const port = 3000; // Define the port variable

app.use(express.static(path.join(__dirname, "/public")));
app.use(bodyParser.json()); // Use body-parser middleware

const client = new Client({
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "neelmitra45",
  database: "Chronolease",
});

client.connect();

cron.schedule("0 0 * * *", async () => {
  try {
    // Execute SQL query to update watch availability
    await client.query(`
      UPDATE Watches
      SET availability = 'available'
      FROM Rentals
      WHERE Watches.watch_id = Rentals.watch_id
        AND Rentals.rental_end_date <= CURRENT_DATE
        AND Watches.availability = 'unavailable'
    `);

    // Update rental status to 'notactive' for rentals whose period is complete
    await client.query(`
      UPDATE Rentals
      SET rental_status = 'Not Active'
      WHERE rental_end_date <= CURRENT_DATE
        AND rental_status = 'active'
    `);

    console.log("Watch availability and rental status updated successfully.");
  } catch (error) {
    console.error(
      "Error updating watch availability and rental status:",
      error.message
    );
  }
});

app.post("/signup", async (req, res) => {
  const userData = req.body;

  try {
    // Insert the user data into the Customers table
    const query = `
      INSERT INTO Customers (name, email, password, address, phone_number, username)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING customer_id
    `;
    const values = [
      userData.name,
      userData.email,
      userData.password,
      userData.address,
      userData.phone_number,
      userData.username, // Adding username here
    ];

    console.log(values); // Check if values array is correctly formed

    const result = await client.query(query, values);
    const insertedCustomerId = result.rows[0].customer_id;

    res.status(201).json({
      message: "User signed up successfully!",
      customerId: insertedCustomerId,
    });
  } catch (error) {
    console.error("Error signing up user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/signin", async (req, res) => {
  const { username, password, type } = req.body;

  try {
    const { rows } = await client.query("SELECT * FROM signin($1, $2, $3)", [
      username,
      password,
      type,
    ]);

    if (rows.length > 0) {
      const { redirectUrl } = rows[0].signin; // Ensure to access the correct property

      res.status(200).json({ redirectUrl }); // Send the redirect URL in the response
    } else {
      res.status(401).send("Invalid username or password.");
    }
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send("Internal server error.");
  }
});

// Server-side code to fetch watch details
// Server-side code to fetch watch details
// Server-side code to fetch watch details
app.get("/watches", async (req, res) => {
  try {
    // Query the database to fetch all watch details
    const result = await client.query(`
      SELECT Watches.*, Brands.brand_name, Categories.category_name
      FROM Watches
      JOIN Brands ON Watches.brand_id = Brands.brand_id
      JOIN Watch_Categories ON Watches.watch_id = Watch_Categories.watch_id
      JOIN Categories ON Watch_Categories.category_id = Categories.category_id
      ORDER BY Watches.availability
    `);
    // Log the retrieved data

    // Send the watch details as JSON response
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching watch details:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/brands", async (req, res) => {
  try {
    // Query the database to fetch all brand names
    const result = await client.query("SELECT brand_name FROM Brands");

    // Extract brand names from the result
    const brands = result.rows.map((row) => row.brand_name);

    // Send the brand names as JSON response
    res.status(200).json(brands);
  } catch (error) {
    console.error("Error fetching brand names:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Server-side code to fetch all category names
app.get("/categories", async (req, res) => {
  try {
    // Query the database to fetch all category names
    const result = await client.query("SELECT category_name FROM Categories");

    // Extract category names from the result
    const categories = result.rows.map((row) => row.category_name);

    // Send the category names as JSON response
    res.status(200).json(categories);
  } catch (error) {
    console.error("Error fetching category names:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/search", async (req, res) => {
  try {
    const { input, brand, category } = req.query;

    // Construct the SQL query based on the provided parameters
    let query = `
      SELECT Watches.*, Brands.brand_name, Categories.category_name
      FROM Watches
      JOIN Brands ON Watches.brand_id = Brands.brand_id
      JOIN Watch_Categories ON Watches.watch_id = Watch_Categories.watch_id
      JOIN Categories ON Watch_Categories.category_id = Categories.category_id
    `;

    const queryParams = [];
    let whereClauseAdded = false;

    if (input) {
      if (!whereClauseAdded) {
        query += " WHERE ";
        whereClauseAdded = true;
      } else {
        query += " AND ";
      }
      query += `model ILIKE $${queryParams.length + 1}`;
      queryParams.push(`%${input}%`);
    }

    if (brand && brand !== "Any") {
      const brandNames = brand.split(",").map((b) => b.trim());
      if (!whereClauseAdded) {
        query += " WHERE ";
        whereClauseAdded = true;
      } else {
        query += " AND ";
      }
      query += `Brands.brand_name IN (${brandNames
        .map((_, i) => `$${queryParams.length + i + 1}`)
        .join(", ")})`;
      queryParams.push(...brandNames);
    }

    if (category && category !== "Any") {
      const categoryNames = category.split(",").map((c) => c.trim());
      if (!whereClauseAdded) {
        query += " WHERE ";
        whereClauseAdded = true;
      } else {
        query += " AND ";
      }
      query += `Categories.category_name IN (${categoryNames
        .map((_, i) => `$${queryParams.length + i + 1}`)
        .join(", ")})`;
      queryParams.push(...categoryNames);
    }

    // Add ORDER BY clause to show available watches first
    query += " ORDER BY availability asc";

    const result = await client.query(query, queryParams);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching search results:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/rent", async (req, res) => {
  try {
    // Fetch the customer ID based on the provided username
    const {
      username,
      watch_id,
      rental_start_date,
      rental_end_date,
      rental_status,
    } = req.body;

    // Query the database to fetch the customer ID
    const query = `
      SELECT customer_id FROM Customers WHERE username = $1
    `;
    const { rows } = await client.query(query, [username]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }
    const customer_id = rows[0].customer_id;

    // Insert the rental request with the fetched customer_id
    const queryInsertRental = `
      INSERT INTO Rentals (customer_id, watch_id, rental_start_date, rental_end_date, rental_status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      customer_id,
      watch_id,
      rental_start_date,
      rental_end_date,
      rental_status,
    ];
    const newRental = await client.query(queryInsertRental, values);

    res.status(201).json(newRental.rows[0]);
  } catch (error) {
    console.error("Error submitting rental request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/watch/:id", async (req, res) => {
  const watchId = req.params.id;

  try {
    // Query the database to fetch watch availability
    const result = await client.query(
      "SELECT availability FROM Watches WHERE watch_id = $1",
      [watchId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Watch not found" });
    } else {
      res.status(200).json({ availability: result.rows[0].availability });
    }
  } catch (error) {
    console.error("Error fetching watch availability:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/payments", async (req, res) => {
  try {
    const username = req.query.username;
    // Add this line to check the received username
    const query = `
      SELECT p.payment_id, p.amount, p.payment_date, p.payment_status, w.model AS watch_model, r.rental_id, r.rental_end_date as due_date
      FROM Payments p
      JOIN Rentals r ON p.rental_id = r.rental_id
      JOIN Watches w ON r.watch_id = w.watch_id
      JOIN Customers c ON r.customer_id = c.customer_id
      WHERE c.username = $1
    `;

    const { rows } = await client.query(query, [username]);
    res.status(200).json(rows);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/payments/:paymentId/pay", async (req, res) => {
  try {
    const paymentId = req.params.paymentId;
    // Update the payment status in the database
    await client.query(
      "UPDATE Payments SET payment_status = 'Paid' WHERE payment_id = $1",
      [paymentId]
    );
    res.sendStatus(204);
  } catch (error) {
    console.error("Error updating payment status:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Server-side code to fetch the count of unread notifications and fetch notifications

app.get("/notifications", async (req, res) => {
  try {
    const username = req.query.username;

    // Fetch the count of unread notifications for the user
    const countQuery = `
      SELECT COUNT(*) AS unread_count
      FROM Notifications
      JOIN Customers ON Notifications.user_id = Customers.customer_id
      WHERE Customers.username = $1 AND is_read = FALSE
    `;
    const countResult = await client.query(countQuery, [username]);
    const unreadCount = countResult.rows[0].unread_count;

    // Fetch notifications for the user from the database
    const query = `
      SELECT notification_id, message, notification_date, is_read
      FROM Notifications
      JOIN Customers ON Notifications.user_id = Customers.customer_id
      WHERE Customers.username = $1
      ORDER BY is_read ASC -- Ordering by unread notifications first
    `;
    const { rows } = await client.query(query, [username]);

    // Send the notifications and unread count as JSON response
    res.status(200).json({ notifications: rows, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/notifications/:id/markAsRead", async (req, res) => {
  try {
    const notificationId = req.params.id;

    // Update the notification as read in the database
    const query = `
      UPDATE Notifications
      SET is_read = TRUE
      WHERE notification_id = $1
    `;
    await client.query(query, [notificationId]);

    res.status(200).send("Notification marked as read successfully");
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/customer/profile/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const { rows } = await client.query(
      `
      WITH customer_profile AS (
        SELECT name, username, email, address, phone_number
        FROM Customers
        WHERE username = $1
      )
      SELECT * FROM customer_profile;
    `,
      [username]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      // Extract customer profile data from the rows returned by the query
      const customerProfile = rows[0];
      res.status(200).json(customerProfile);
    }
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/employee/profile/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const { rows } = await client.query(
      `
      WITH customer_profile AS (
        SELECT name, username, email, role
        FROM employees
        WHERE username = $1
      )
      SELECT * FROM customer_profile;
    `,
      [username]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Customer not found" });
    } else {
      // Extract customer profile data from the rows returned by the query
      const customerProfile = rows[0];
      res.status(200).json(customerProfile);
    }
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/watches/:watchId", async (req, res) => {
  const watchId = req.params.watchId;

  try {
    // Delete the watch with the provided ID from the database
    const result = await client.query(
      "DELETE FROM Watches WHERE watch_id = $1",
      [watchId]
    );

    if (result.rowCount === 1) {
      res.sendStatus(200); // Send success status
    } else {
      res.status(404).json({ error: "Watch not found" }); // Send error status and message
    }
  } catch (error) {
    console.error("Error deleting watch:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/watchesinsert", async (req, res) => {
  try {
    const { brand, model, price_per_day, category } = req.body;

    // Fetch brand id if brand exists
    const brandQuery = await client.query(
      "SELECT brand_id FROM Brands WHERE brand_name = $1",
      [brand]
    );
    const brandId = brandQuery.rows[0]?.brand_id;

    if (!brandId) {
      return res.status(400).json({ error: "Brand does not exist" });
    }

    // Insert into Watches table
    const watchResult = await client.query(
      "INSERT INTO Watches (brand_id, model, price_per_day, availability) VALUES ($1, $2, $3, $4) RETURNING watch_id",
      [brandId, model, price_per_day, "available"]
    );
    const watchId = watchResult.rows[0]?.watch_id;

    if (!watchId) {
      console.error("Failed to insert into Watches table");
      return res
        .status(500)
        .json({ error: "Failed to insert into Watches table" });
    }

    console.log("Inserted into Watches table. Watch ID:", watchId);

    // Insert into Watch_Categories junction table
    await client.query(
      "INSERT INTO Watch_Categories (watch_id, category_id) SELECT $1, category_id FROM Categories WHERE category_name = $2",
      [watchId, category]
    );

    console.log(`Inserted watch ${watchId} into category ${category}`);

    res.status(201).json({ message: "Watch added successfully" });
  } catch (error) {
    console.error("Error adding watch:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to fetch rental history for a watch
app.post("/watchhistory", async (req, res) => {
  try {
    const { watchId } = req.body;

    // Query the database to fetch rental history for the specified watchId using the view
    const rentalHistoryQuery = await client.query(
      "SELECT watch_name, customer_name, rental_id, formatted_start_date, formatted_end_date, rental_status FROM watch_rental_history_view WHERE watch_id = $1",
      [watchId]
    );

    const rentalHistory = rentalHistoryQuery.rows;

    res
      .status(200)
      .json({ watchName: rentalHistory[0]?.watch_name, rentalHistory });
  } catch (error) {
    console.error("Error fetching rental history:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
