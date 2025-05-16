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
  // VULNERÁVEL: Blind SQLi na postagem de mensagem
  // O parâmetro content é concatenado diretamente na query SQL
  const query = `INSERT INTO messages (username, content, planet) 
                  VALUES ('${username}', '${content}', '${
    planet || "Unknown"
  }')`;

  db.run(query, (err) => {
    if (err) {
      console.error("Erro no banco de dados:", err.message);
      return res.status(500).send("Erro ao postar mensagem");
    }
    res.redirect("/forum.html");
  });
});

// Listar todas as mensagens
app.get("/messages", (req, res) => {
  db.all(
    "SELECT id, username, content, planet, timestamp FROM messages ORDER BY id DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Erro no BD" });
      res.json(rows);
    }
  );
});

// Blind SQLi vulnerable endpoint for messages
app.get("/message", (req, res) => {
  const id = req.query.id;
  // Intencionalmente vulnerável: entrada do usuário diretamente na query
  db.get(`SELECT * FROM messages WHERE id = ${id}`, (err, row) => {
    if (err) return res.status(500).send("Erro no BD");
    // Cego: apenas informa se existe ou não
    if (row) {
      res.send("Mensagem existe");
    } else {
      res.send("Mensagem não encontrada");
    }
  });
});

// Get all planets
app.get("/planets", (req, res) => {
  db.all("SELECT * FROM planets ORDER BY name", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro no BD" });
    res.json(rows);
  });
});

// Get planet details
app.get("/planet/:name", (req, res) => {
  const planetName = req.params;
  // Outro ponto potencial de injeção SQL (intencional)
  const query = `SELECT * FROM planets WHERE name = '${planetName}'`;

  db.get(query, (err, planet) => {
    if (err) return res.status(500).json({ error: "Erro no BD" });
    if (!planet)
      return res.status(404).json({ error: "Planeta não encontrado" });
    res.json(planet);
  });
});

// Obter transações de especiaria
app.get("/spice-transactions", (req, res) => {
  db.all(
    "SELECT * FROM spice_transactions ORDER BY transaction_date DESC",
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Erro no BD" });
      res.json(rows);
    }
  );
});

// Endpoint de registro
app.post("/register", (req, res) => {
  const { username, password, confirmPassword, house } = req.body;

  if (password !== confirmPassword) {
    return res.redirect("/register.html?error=As+senhas+não+coincidem");
  }

  // Atualizado para incluir afiliação de casa
  db.run(
    "INSERT INTO users (username, password, house) VALUES (?, ?, ?)",
    [username, password, house || "Nenhuma"],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return res.redirect("/register.html?error=Nome+de+usuário+já+existe");
        }
        return res.redirect("/register.html?error=Falha+no+cadastro");
      }
      res.redirect("/login.html?success=1");
    }
  );
});

// Endpoint de login com vulnerabilidade de injeção SQL cega
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // VULNERÁVEL: Injeção SQL cega na query de login
  // concatenando diretamente a entrada do usuário na query SQL
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, user) => {
    if (err) {
      console.error("Erro no banco de dados:", err.message);
      return res.redirect("/login.html?error=1");
    }

    if (user) {
      // Login bem-sucedido
      req.session.user = {
        id: user.id,
        username: user.username,
        house: user.house,
        role: user.role,
      };
      res.redirect("/forum.html");
    } else {
      // Login falhou
      res.redirect("/login.html?error=1");
    }
  });
});

// Verificar se o usuário está autenticado
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

// Obter informação de casas
app.get("/houses", (req, res) => {
  db.all("SELECT DISTINCT house FROM users ORDER BY house", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro no BD" });
    res.json(rows.map((row) => row.house));
  });
});

// Endpoint de logout
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

app.listen(3000, () => {
  console.log(
    "Rede de Comunicação de Arrakis rodando em http://localhost:3000"
  );
});
