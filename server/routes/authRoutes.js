const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');

// Register
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, role, phone } = req.body;

    if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        // Check if user exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert user
        // Role default is 'user' if not provided
        const userRole = role || 'user';

        const newUser = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password, role, phone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, last_name, email, role',
            [first_name, last_name, email, hashedPassword, userRole, phone || null]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Please provide email and password' });
    }

    try {
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        // Return JWT
        const payload = {
            user: {
                id: user.rows[0].id,
                role: user.rows[0].role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret', // Use env var in real app
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token,
                    user: {
                        id: user.rows[0].id,
                        first_name: user.rows[0].first_name,
                        last_name: user.rows[0].last_name,
                        email: user.rows[0].email,
                        role: user.rows[0].role
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get current user (Protected)
router.get('/me', auth, async (req, res) => {
    try {
        const user = await pool.query(
            'SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (user.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
