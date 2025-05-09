const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('duna.db');

db.serialize(() => {
  // Create messages table
  db.run(`DROP TABLE IF EXISTS messages`);
  db.run(`CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    content TEXT NOT NULL,
    planet TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert Dune-themed messages
  const msgStmt = db.prepare('INSERT INTO messages (username, content, planet) VALUES (?, ?, ?)');
  msgStmt.run('PaulAtreides', 'The spice must flow. Welcome to the Arrakis Communication Network.', 'Arrakis');
  msgStmt.run('LadyJessica', 'Remember your Bene Gesserit training. Fear is the mind-killer.', 'Caladan');
  msgStmt.run('LetoBaron', 'House Harkonnen stands ready to crush any opposition.', 'Giedi Prime');
  msgStmt.run('Stilgar', 'Water discipline must be maintained at all times in the sietch.', 'Arrakis');
  msgStmt.run('Chani', 'I have seen visions of the future in the spice trance.', 'Arrakis');
  msgStmt.run('GurneyHalleck', 'Mood is a thing for cattle and loveplay, not fighting!', 'Caladan');
  msgStmt.run('DuncanIdaho', 'My loyalty to House Atreides is unwavering.', 'Caladan');
  msgStmt.run('Piter', 'The calculations are precise. The trap is set.', 'Giedi Prime');
  msgStmt.run('Irulan', 'I begin this chronicle of Muad\'Dib with stories from the sietch.', 'Kaitain');
  msgStmt.run('Liet', 'The ecological transformation of Arrakis is proceeding according to plan.', 'Arrakis');
  msgStmt.finalize();

  // Create users table
  db.run(`DROP TABLE IF EXISTS users`);
  db.run(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    house TEXT NOT NULL,
    role TEXT DEFAULT 'user'
  )`);

  // Insert Dune-themed users
  const userStmt = db.prepare('INSERT INTO users (username, password, house, role) VALUES (?, ?, ?, ?)');
  userStmt.run('PaulAtreides', 'muadDib123', 'Atreides', 'admin');
  userStmt.run('LadyJessica', 'beneGesserit456', 'Atreides', 'moderator');
  userStmt.run('DukeLeto', 'caladan789', 'Atreides', 'admin');
  userStmt.run('LetoBaron', 'harkonnen123', 'Harkonnen', 'admin');
  userStmt.run('Feyd', 'gladiator456', 'Harkonnen', 'user');
  userStmt.run('Stilgar', 'sietch789', 'Fremen', 'moderator');
  userStmt.run('Chani', 'sayyadina123', 'Fremen', 'user');
  userStmt.run('GurneyHalleck', 'warrior456', 'Atreides', 'user');
  userStmt.run('DuncanIdaho', 'swordmaster789', 'Atreides', 'user');
  userStmt.run('Thufir', 'mentat123', 'Atreides', 'user');
  userStmt.run('Piter', 'twisted456', 'Harkonnen', 'user');
  userStmt.run('Irulan', 'princess789', 'Corrino', 'moderator');
  userStmt.run('Shaddam', 'emperor123', 'Corrino', 'admin');
  userStmt.run('Liet', 'kynes456', 'Fremen', 'user');
  userStmt.run('Alia', 'preborn789', 'Atreides', 'user');
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
  const planetStmt = db.prepare('INSERT INTO planets (name, description, spice_presence, controlling_house) VALUES (?, ?, ?, ?)');
  planetStmt.run('Arrakis', 'Desert planet also known as Dune, the only source of the spice melange', 1, 'Atreides');
  planetStmt.run('Caladan', 'Ocean planet, ancestral home of House Atreides', 0, 'Atreides');
  planetStmt.run('Giedi Prime', 'Industrial planet, home of House Harkonnen', 0, 'Harkonnen');
  planetStmt.run('Kaitain', 'Imperial capital planet, home to the Emperor', 0, 'Corrino');
  planetStmt.run('Salusa Secundus', 'Prison planet, harsh environment used to train Sardaukar troops', 0, 'Corrino');
  planetStmt.run('IX', 'Technological center known for advanced machinery and mentats', 0, 'Vernius');
  planetStmt.run('Wallach IX', 'Home of the Bene Gesserit school', 0, 'Bene Gesserit');
  planetStmt.run('Lankiveil', 'Cold planet with large oceans and few land masses', 0, 'Harkonnen');
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
  const transactionStmt = db.prepare('INSERT INTO spice_transactions (seller, buyer, amount, price) VALUES (?, ?, ?, ?)');
  transactionStmt.run('Fremen', 'House Atreides', 100.0, 200000.0);
  transactionStmt.run('House Atreides', 'CHOAM', 80.0, 180000.0);
  transactionStmt.run('Fremen', 'House Harkonnen', 50.0, 95000.0);
  transactionStmt.run('House Harkonnen', 'Spacing Guild', 45.0, 110000.0);
  transactionStmt.run('Fremen', 'Bene Gesserit', 30.0, 65000.0);
  transactionStmt.run('Smugglers', 'House Corrino', 20.0, 60000.0);
  transactionStmt.run('Fremen', 'Spacing Guild', 150.0, 350000.0);
  transactionStmt.finalize();

  console.log('Database has been set up with Dune-themed data.');
});

db.close();