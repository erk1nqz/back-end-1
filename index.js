const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const { Pool } = require('pg');
const pool = new Pool({
    host: "localhost",
    user: "Your user for db",
    port: 5432,
    password: "Your password",
    database: "Your database name"
});

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
    const client = await pool.connect();
    try {
        const result = await client.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);

        if (result.rows.length > 0) {
            res.json({ success: true, message: 'You have successfully logged in.' });
        } else {
            res.json({ success: false, message: 'Invalid username or password.' });
        }
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    } finally {
        client.release(); // Release the connection back to the pool
    }
});

// Route: Register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/pages/register.html'));
});

// Route: Handle registration POST request
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Insert user registration data into the database
    const client = await pool.connect();

    try {
        await client.query('INSERT INTO users (userName, email, password) VALUES ($1, $2, $3)', [username, email, password]);
        res.status(200).json({
            "status": "success",
            "message": `You have successfully registered an account.`
        });
    } catch (error) {
        console.error('Error executing query:', error);
        res.status(500).json({
            "success": false,
            "message": "Something went wrong. Please try again."
        });
    } finally {
        client.release();
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});