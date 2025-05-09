# Forum with Blind SQL Injection

## Setup

1. Install dependencies:

```
npm install
```

2. Initialize the database with sample data:

```
node setup-db.js
```

3. Start the server:

```
npm start
```

4. Access the forum at: http://localhost:3000

## Vulnerabilities

The `/message` endpoint is intentionally vulnerable to blind SQL injection. It takes an `id` parameter directly from user input without sanitization:

```javascript
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
```

### Example Attack

You can test the blind SQL injection by using the endpoint:

- Normal request: `/message?id=1`
- Boolean-based injection: `/message?id=1 AND 1=1` (returns "Message exists")
- Boolean-based injection: `/message?id=1 AND 1=2` (returns "No message")
