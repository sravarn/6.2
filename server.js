// server.js
const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const authenticateToken = require('./authMiddleware');

const app = express();
const PORT = 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// --- Simple Bank State (In-Memory for this example) ---
let accountBalance = 1000.00;
const USERNAME = 'user123';
const PASSWORD = 'password123'; // Hardcoded credentials

// --- JWT Configuration ---
const JWT_SECRET = process.env.JWT_SECRET;

// --- 1. Login Route (Public) ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // 1. Verify credentials (Hardcoded check)
    if (username === USERNAME && password === PASSWORD) {
        
        // 2. Create the JWT payload (the data we want to store in the token)
        const userPayload = { 
            username: username, 
            accountId: 'ACC001' 
        };
        
        // 3. Generate the token
        // Sign the payload with the secret, and set an expiration (e.g., 1 hour)
        const accessToken = jwt.sign(
            userPayload, 
            JWT_SECRET, 
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // 4. Send the token back to the client
        res.json({ 
            message: 'Login successful', 
            token: accessToken 
        });
    } else {
        // Invalid credentials
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

// --- 2. Protected Banking Routes ---
// The 'authenticateToken' middleware runs *before* the route handler for all these routes.

// A. View Balance
app.get('/balance', authenticateToken, (req, res) => {
    // req.user contains the decoded payload (e.g., { username: 'user123', accountId: 'ACC001' })
    console.log(`Access granted for user: ${req.user.username}`);
    
    res.json({ 
        message: 'Account balance retrieved successfully',
        balance: accountBalance 
    });
});

// B. Deposit Money
app.post('/deposit', authenticateToken, (req, res) => {
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: 'Invalid deposit amount' });
    }

    accountBalance += amount;
    
    res.json({ 
        message: `${amount} deposited successfully.`, 
        newBalance: accountBalance 
    });
});

// C. Withdraw Money
app.post('/withdraw', authenticateToken, (req, res) => {
    const { amount } = req.body;

    if (typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ message: 'Invalid withdrawal amount' });
    }

    // Handle Insufficient Balance Error
    if (amount > accountBalance) {
        return res.status(400).json({ 
            message: 'Insufficient balance for this withdrawal.' 
        });
    }

    accountBalance -= amount;
    
    res.json({ 
        message: `${amount} withdrawn successfully.`, 
        newBalance: accountBalance 
    });
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Banking API running on http://localhost:${PORT}`);
});
