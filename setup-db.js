const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("duna.db");

db.serialize(() => {
  // Criar tabela de mensagens
  db.run(`DROP TABLE IF EXISTS messages`);
  db.run(`CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    planet TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  // Inserir mensagens temáticas de Duna
  const msgStmt = db.prepare(
    "INSERT INTO messages (username, content, planet) VALUES (?, ?, ?)"
  );
  msgStmt.run(
    "PaulAtreides",
    "A especiaria deve fluir. Bem-vindo à Rede de Comunicação de Arrakis.",
    "Arrakis"
  );
  msgStmt.run(
    "LadyJessica",
    "Lembre-se do seu treinamento Bene Gesserit. O medo é o assassino da mente.",
    "Caladan"
  );
  msgStmt.run(
    "LetoBaron",
    "A Casa Harkonnen está pronta para esmagar qualquer oposição.",
    "Giedi Prime"
  );
  msgStmt.run(
    "Stilgar",
    "A disciplina da água deve ser mantida o tempo todo no sietch.",
    "Arrakis"
  );
  msgStmt.run(
    "Chani",
    "Eu vi visões do futuro no transe da especiaria.",
    "Arrakis"
  );
  msgStmt.run(
    "GurneyHalleck",
    "Humor é coisa para gado e jogos de amor, não para lutas!",
    "Caladan"
  );
  msgStmt.run(
    "DuncanIdaho",
    "Minha lealdade à Casa Atreides é inabalável.",
    "Caladan"
  );
  msgStmt.run(
    "Piter",
    "Os cálculos são precisos. A armadilha está montada.",
    "Giedi Prime"
  );
  msgStmt.run(
    "Irulan",
    "Eu começo esta crônica de Muad'Dib com histórias do sietch.",
    "Kaitain"
  );
  msgStmt.run(
    "Liet",
    "A transformação ecológica de Arrakis está procedendo de acordo com o plano.",
    "Arrakis"
  );
  msgStmt.finalize();
  // Criar tabela de usuários
  db.run(`DROP TABLE IF EXISTS users`);
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    house TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  )`);

  // Inserir usuários temáticos de Duna
  const userStmt = db.prepare(
    "INSERT INTO users (username, password, house, role) VALUES (?, ?, ?, ?)"
  );
  userStmt.run("PaulAtreides", "admin123", "Atreides", "admin");
  userStmt.run("LadyJessica", "beneGesserit456", "Atreides", "moderator");
  userStmt.run("DukeLeto", "caladan789", "Atreides", "admin");
  userStmt.run("LetoBaron", "harkonnen123", "Harkonnen", "admin");
  userStmt.run("Feyd", "gladiator456", "Harkonnen", "user");
  userStmt.run("Stilgar", "sietch789", "Fremen", "moderator");
  userStmt.run("Chani", "sayyadina123", "Fremen", "user");
  userStmt.run("GurneyHalleck", "warrior456", "Atreides", "user");
  userStmt.run("DuncanIdaho", "swordmaster789", "Atreides", "user");
  userStmt.run("Thufir", "mentat123", "Atreides", "user");
  userStmt.run("Piter", "twisted456", "Harkonnen", "user");
  userStmt.run("Irulan", "princess789", "Corrino", "moderator");
  userStmt.run("Shaddam", "emperor123", "Corrino", "admin");
  userStmt.run("Liet", "kynes456", "Fremen", "user");
  userStmt.run("Alia", "preborn789", "Atreides", "user");
  userStmt.finalize();

  // Create planets table
  db.run(`DROP TABLE IF EXISTS planets`);
  db.run(`CREATE TABLE planets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    spice_presence BOOLEAN DEFAULT 0,
    controlling_house TEXT
  )`);

  // Insert Dune-themed planets
  const planetStmt = db.prepare(
    "INSERT INTO planets (name, description, spice_presence, controlling_house) VALUES (?, ?, ?, ?)"
  );
  planetStmt.run(
    "Arrakis",
    "Desert planet also known as Dune, the only source of the spice melange",
    1,
    "Atreides"
  );
  planetStmt.run(
    "Caladan",
    "Ocean planet, ancestral home of House Atreides",
    0,
    "Atreides"
  );
  planetStmt.run(
    "Giedi Prime",
    "Industrial planet, home of House Harkonnen",
    0,
    "Harkonnen"
  );
  planetStmt.run(
    "Kaitain",
    "Imperial capital planet, home to the Emperor",
    0,
    "Corrino"
  );
  planetStmt.run(
    "Salusa Secundus",
    "Prison planet, harsh environment used to train Sardaukar troops",
    0,
    "Corrino"
  );
  planetStmt.run(
    "IX",
    "Technological center known for advanced machinery and mentats",
    0,
    "Vernius"
  );
  planetStmt.run(
    "Wallach IX",
    "Home of the Bene Gesserit school",
    0,
    "Bene Gesserit"
  );
  planetStmt.run(
    "Lankiveil",
    "Cold planet with large oceans and few land masses",
    0,
    "Harkonnen"
  );
  planetStmt.finalize();

  // Create spice_transactions table
  db.run(`DROP TABLE IF EXISTS spice_transactions`);
  db.run(`CREATE TABLE spice_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller TEXT NOT NULL,
    buyer TEXT NOT NULL,
    amount REAL NOT NULL,
    price REAL NOT NULL,
    transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert sample spice transactions
  const transactionStmt = db.prepare(
    "INSERT INTO spice_transactions (seller, buyer, amount, price) VALUES (?, ?, ?, ?)"
  );
  transactionStmt.run("Fremen", "House Atreides", 100.0, 200000.0);
  transactionStmt.run("House Atreides", "CHOAM", 80.0, 180000.0);
  transactionStmt.run("Fremen", "House Harkonnen", 50.0, 95000.0);
  transactionStmt.run("House Harkonnen", "Spacing Guild", 45.0, 110000.0);
  transactionStmt.run("Fremen", "Bene Gesserit", 30.0, 65000.0);
  transactionStmt.run("Smugglers", "House Corrino", 20.0, 60000.0);
  transactionStmt.run("Fremen", "Spacing Guild", 150.0, 350000.0);
  transactionStmt.finalize();

  console.log("Database has been set up...");
});

db.close();
