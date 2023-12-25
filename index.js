const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const { Client } = require('pg');
const client = new Client({
    host: "localhost",
    user: "postgres",
    port: 5432,
    password: "somePassword",
    database: "backAuth"
});

client.connect();

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route: Default route, serves the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route: Login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/login.html'));
});

// Route: Handle login POST request
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // Query the database to check if the provided credentials are valid
        const result = await client.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);

        if (result.rows.length > 0) {
            res.json({ success: true, message: 'You have successfully logged in.' });
        } else {
            res.json({ success: false, message: 'Invalid username or password.' });
        }
    } catch (error) {
        // Handle database query errors
        console.error('Error executing query:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

// Route: Register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/register.html'));
});

// Route: Handle registration POST request
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Insert user registration data into the database
    client.query(`INSERT INTO users (userName, email, password) VALUES ('${username}', '${email}', '${password}')`, (err, result) => {
        if (err) {
            res.status(500).json({
                "success": false,
                "message": "Something went wrong. Please try again."
            });
        }
        // Close the database connection
        client.end();
    });

    res.status(200).json({
        "status": "success",
        "message": `You have successfully registered an account.`
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
