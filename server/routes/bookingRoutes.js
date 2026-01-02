const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const { sendBookingConfirmation } = require('../utils/emailService');

// Create booking (Protected)
router.post('/', auth, async (req, res) => {
    const { showtime_id, seats, total_amount } = req.body; // seats is array/json

    // Validate inputs
    if (!showtime_id || !seats || !total_amount) {
        return res.status(400).json({ msg: 'Please provide showtime_id, seats (array) and total_amount' });
    }

    try {
        // Generate simple references
        const bookingReference = 'REF-' + Date.now();
        const seatsData = JSON.stringify(seats);

        const newBooking = await pool.query(
            'INSERT INTO bookings (user_id, showtime_id, seats, total_amount, booking_status, payment_status, booking_reference) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [req.user.id, showtime_id, seatsData, total_amount, 'confirmed', 'paid', bookingReference]
        );

        const bookingObj = newBooking.rows[0];

        // Fetch context for confirmation email
        try {
            const detailRes = await pool.query(`
                SELECT b.booking_reference, b.total_amount, b.seats,
                       m.title, s.show_date, s.show_time, u.email
                FROM bookings b
                JOIN showtimes s ON b.showtime_id = s.id
                JOIN movies m ON s.movie_id = m.id
                JOIN users u ON b.user_id = u.id
                WHERE b.id = $1
            `, [bookingObj.id]);

            if (detailRes.rows.length > 0) {
                const info = detailRes.rows[0];
                // Send email asynchronously so we don't block the user response
                sendBookingConfirmation(info.email, {
                    title: info.title,
                    show_date: info.show_date,
                    show_time: info.show_time,
                    seats: seats, // Use the original array from req.body
                    total_amount: info.total_amount,
                    booking_reference: info.booking_reference
                }).catch(e => console.error('Background Email Error:', e));
            }
        } catch (emailErr) {
            console.error('Failed to prepare confirmation email:', emailErr);
        }

        res.json(bookingObj);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get user bookings (Protected)
router.get('/', auth, async (req, res) => {
    try {
        // Join bookings -> showtimes -> movies
        const result = await pool.query(
            `SELECT b.*, m.title, s.show_date, s.show_time 
       FROM bookings b 
       JOIN showtimes s ON b.showtime_id = s.id 
       JOIN movies m ON s.movie_id = m.id 
       WHERE b.user_id = $1`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Cancel booking (Protected)
router.put('/:id/cancel', auth, async (req, res) => {
    try {
        // Verify ownership
        const booking = await pool.query('SELECT * FROM bookings WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        if (booking.rows.length === 0) {
            return res.status(404).json({ msg: 'Booking not found or access denied' });
        }

        // Logic check: Can't cancel if already cancelled or past date? 
        // For simple demo, just allow update status.
        const update = await pool.query(
            "UPDATE bookings SET booking_status = 'cancelled' WHERE id = $1 RETURNING *",
            [req.params.id]
        );

        res.json(update.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
