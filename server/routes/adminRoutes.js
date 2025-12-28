const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get Dashboard Stats (Admin only)
router.get('/stats', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') return res.status(403).send('Access denied');

    try {
        const usersCount = await pool.query('SELECT COUNT(*) FROM users');
        const moviesCount = await pool.query('SELECT COUNT(*) FROM movies');
        const bookingsCount = await pool.query('SELECT COUNT(*) FROM bookings');
        const revenue = await pool.query("SELECT SUM(total_amount) FROM bookings WHERE booking_status = 'confirmed'");

        res.json({
            users: parseInt(usersCount.rows[0].count),
            movies: parseInt(moviesCount.rows[0].count),
            bookings: parseInt(bookingsCount.rows[0].count),
            revenue: parseFloat(revenue.rows[0].sum || 0).toFixed(2)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get all users
router.get('/users', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') return res.status(403).send('Access denied');
    try {
        const result = await pool.query('SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Delete user
router.delete('/users/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') return res.status(403).send('Access denied');
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ msg: 'User removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
