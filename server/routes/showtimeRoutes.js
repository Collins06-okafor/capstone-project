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

module.exports = router;
