const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");

const app = express();
const db = new sqlite3.Database("duna.db");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "arrakis_spice_melange",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // set to true if using https
  })
);

// Create tables if not exists - Now managed by setup-db.js
// Tables in our DB: messages, users, planets, spice_transactions

// Post a new message - with blind SQL injection vulnerability
// Example exploit: Using the content field with payload like:
// content=test' AND (SELECT substr(password,1,1) FROM users WHERE username='PaulAtreides')='m' AND '1'='1
// This will execute normally if the first character of Paul's password is 'm'
// If not, it will appear to fail with an error but not tell you the exact reason
app.post("/post", (req, res) => {
  const { username, content, planet } = req.body;

  // VULNERABLE: Blind SQL injection in the message posting
  // The content parameter is directly concatenated into the SQL query
  const query = `INSERT INTO messages (username, content, planet) 
                  VALUES ('${username}', '${content}', '${
    planet || "Unknown"
  }')`;

  db.run(query, (err) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Error posting message");
    }
    res.redirect("/forum.html");
  });
});

// List all messages
app.get("/messages", (req, res) => {
  db.all(
    "SELECT id, username, content, planet, timestamp FROM messages ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    }
  );
});

// Blind SQLi vulnerable endpoint for messages
app.get("/message", (req, res) => {
  const id = req.query.id;
  // Intentionally vulnerable: user input directly in query
  db.get(`SELECT * FROM messages WHERE id = ${id}`, (err, row) => {
    if (err) return res.status(500).send("DB error");
    // Blind: only tell if exists or not
    if (row) {
      res.send("Message exists");
    } else {
      res.send("No message");
    }
  });
});

// Get all planets
app.get("/planets", (req, res) => {
  db.all("SELECT * FROM planets ORDER BY name", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// Get planet details
app.get("/planet/:name", (req, res) => {
  const planetName = req.params;
  // Another potential SQL injection point (intentional)
  const query = `SELECT * FROM planets WHERE name = '${planetName}'`;

  db.get(query, (err, planet) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!planet) return res.status(404).json({ error: "Planet not found" });
    res.json(planet);
  });
});

// Get spice transactions
app.get("/spice-transactions", (req, res) => {
  db.all(
    "SELECT * FROM spice_transactions ORDER BY transaction_date DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "DB error" });
      res.json(rows);
    }
  );
});

// Register endpoint
app.post("/register", (req, res) => {
  const { username, password, confirmPassword, house } = req.body;

  if (password !== confirmPassword) {
    return res.redirect("/register.html?error=Passwords+do+not+match");
  }

  // Updated to include house affiliation
  db.run(
    "INSERT INTO users (username, password, house) VALUES (?, ?, ?)",
    [username, password, house || "None"],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.redirect("/register.html?error=Username+already+exists");
        }
        return res.redirect("/register.html?error=Registration+failed");
      }
      res.redirect("/login.html?success=1");
    }
  );
});

// Login endpoint with blind SQL injection vulnerability
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // VULNERABLE: Blind SQL injection in the login query
  // directly concatenating user input in SQL query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, user) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.redirect("/login.html?error=1");
    }

    if (user) {
      // Login successful
      req.session.user = {
        id: user.id,
        username: user.username,
        house: user.house,
        role: user.role,
      };
      res.redirect("/forum.html");
    } else {
      // Login failed
      res.redirect("/login.html?error=1");
    }
  });
});

// Check if user is authenticated
app.get("/auth-status", (req, res) => {
  if (req.session.user) {
    res.json({
      authenticated: true,
      user: {
        username: req.session.user.username,
        house: req.session.user.house,
        role: req.session.user.role,
      },
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Get house information
app.get("/houses", (req, res) => {
  db.all("SELECT DISTINCT house FROM users ORDER BY house", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows.map((row) => row.house));
  });
});

// Logout endpoint
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Arrakis Communication Network running on http://localhost:3000");
});
