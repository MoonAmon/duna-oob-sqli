/**
 * DUNA SECURITY PATCH
 * 
 * Vulnerabilidades corrigidas:
 * 1. Blind SQL Injection no endpoint /post
 * 2. Blind SQL Injection no endpoint /message
 * 3. SQL Injection no endpoint /planet/:name
 * 4. Blind SQL Injection no endpoint /login
 */

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

// CORREÇÃO 1: Endpoint /post - Usar parâmetros parametrizados em vez de concatenação direta
app.post("/post", (req, res) => {
  const { username, content, planet } = req.body;
  
  // CORRIGIDO: Usando parâmetros parametrizados para prevenir SQL injection
  const query = `INSERT INTO messages (username, content, planet) VALUES (?, ?, ?)`;
  
  db.run(query, [username, content, planet || "Unknown"], (err) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.status(500).send("Error posting message");
    }
    res.redirect("/forum.html");
  });
});

// mensagens
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

// CORREÇÃO 2: Endpoint /message - Usar parâmetros parametrizados para id
app.get("/message", (req, res) => {
  const id = req.query.id;
  
  // CORRIGIDO: Usando parâmetros parametrizados para prevenir SQL injection
  db.get("SELECT * FROM messages WHERE id = ?", [id], (err, row) => {
    if (err) return res.status(500).send("DB error");
    // Blind: apenas informar se existe ou não
    if (row) {
      res.send("Message exists");
    } else {
      res.send("No message");
    }
  });
});

// planetas
app.get("/planets", (req, res) => {
  db.all("SELECT * FROM planets ORDER BY name", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(rows);
  });
});

// CORREÇÃO 3: Endpoint /planet/:name - Usar parâmetros parametrizados
app.get("/planet/:name", (req, res) => {
  const planetName = req.params.name; // Corrigido: acessando o nome corretamente
  
  // CORRIGIDO: Usando parâmetros parametrizados para prevenir SQL injection
  const query = "SELECT * FROM planets WHERE name = ?";

  db.get(query, [planetName], (err, planet) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (!planet) return res.status(404).json({ error: "Planet not found" });
    res.json(planet);
  });
});

// spice transactions
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

// endpoint registro
app.post("/register", (req, res) => {
  const { username, password, confirmPassword, house } = req.body;

  if (password !== confirmPassword) {
    return res.redirect("/register.html?error=Passwords+do+not+match");
  }

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

// CORREÇÃO 4: Endpoint /login - Usar parâmetros parametrizados
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // CORRIGIDO: Usando parâmetros parametrizados para prevenir SQL injection
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";

  db.get(query, [username, password], (err, user) => {
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

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Arrakis Communication Network running on http://localhost:3000");
});