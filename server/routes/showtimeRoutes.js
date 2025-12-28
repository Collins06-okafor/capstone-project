const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get usage of seats for a showtime (for visual map)
router.get('/:id/seats', async (req, res) => {
    try {
        // We need all bookings for this showtime
        const result = await pool.query('SELECT seats FROM bookings WHERE showtime_id = $1 AND booking_status != $2', [req.params.id, 'cancelled']);

        // Aggregate all seats
        let bookedSeats = [];
        result.rows.forEach(row => {
            // seats is JSONB column, pg parses it. 
            // It might be an array [1, 2] or ["A1", "A2"]
            if (Array.isArray(row.seats)) {
                bookedSeats = [...bookedSeats, ...row.seats];
            } else if (typeof row.seats === 'string') {
                // in case it's a string representation
                try {
                    const parsed = JSON.parse(row.seats);
                    if (Array.isArray(parsed)) bookedSeats = [...bookedSeats, ...parsed];
                } catch (e) { }
            }
        });

        res.json(bookedSeats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

const auth = require('../middleware/auth');

// Create showtime (Admin only)
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') return res.status(403).send('Access denied');

    const { movie_id, show_date, show_time, price, screen_id } = req.body;

    // Basic Validation
    if (!movie_id || !show_date || !show_time || !price) {
        return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    try {
        const newShowtime = await pool.query(
            'INSERT INTO showtimes (movie_id, show_date, show_time, price, screen_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [movie_id, show_date, show_time, price, screen_id || 1] // Default screen 1
        );
        res.json(newShowtime.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
