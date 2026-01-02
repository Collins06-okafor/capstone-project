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
// Create showtime (Admin only) - Supports Date Range
router.post('/', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') return res.status(403).send('Access denied');

    const { movie_id, show_date, start_date, end_date, show_time, price, screen_id } = req.body;

    // Determine range
    let start = start_date ? new Date(start_date) : (show_date ? new Date(show_date) : null);
    let end = end_date ? new Date(end_date) : (show_date ? new Date(show_date) : null);

    if (!movie_id || !start || !end || !show_time || !price) {
        return res.status(400).json({ msg: 'Please provide all required fields (movie_id, date range, time, price)' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const createdShowtimes = [];
        let current = new Date(start);
        const now = new Date();

        // Get screen capacity
        const screenRes = await client.query('SELECT total_seats FROM screens WHERE id = $1', [screen_id || 1]);
        const totalSeats = screenRes.rows.length > 0 ? screenRes.rows[0].total_seats : 100;

        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            const showDateTime = new Date(`${dateStr}T${show_time}`);

            if (showDateTime < now) {
                // If it's a range, we might just skip the past dates. 
                // If it's a single date that is in the past, maybe error?
                // For simplicity and range support, let's skip past dates.
                current.setDate(current.getDate() + 1);
                continue;
            }

            const newShowtime = await client.query(
                'INSERT INTO showtimes (movie_id, show_date, show_time, price, theater_id, available_seats) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [movie_id, dateStr, show_time, price, screen_id || 1, totalSeats]
            );
            createdShowtimes.push(newShowtime.rows[0]);

            // Next day
            current.setDate(current.getDate() + 1);
        }

        await client.query('COMMIT');
        res.json(createdShowtimes); // Return array of created showtimes
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});

module.exports = router;
