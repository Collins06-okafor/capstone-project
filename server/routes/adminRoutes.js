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

        // Get stats by movie
        const movieStatsHandler = await pool.query(`
            SELECT 
                m.id, 
                m.title, 
                COUNT(b.id) as total_bookings, 
                COALESCE(SUM(b.total_amount), 0) as total_revenue 
            FROM movies m
            LEFT JOIN showtimes s ON m.id = s.movie_id
            LEFT JOIN bookings b ON s.id = b.showtime_id AND b.booking_status = 'confirmed'
            GROUP BY m.id, m.title
            ORDER BY total_revenue DESC
        `);

        // Get daily stats
        const dailyStatsHandler = await pool.query(`
            SELECT 
                TO_CHAR(s.show_date, 'YYYY-MM-DD') as date,
                COUNT(b.id) as total_bookings,
                COALESCE(SUM(b.total_amount), 0) as total_revenue
            FROM showtimes s
            JOIN bookings b ON s.id = b.showtime_id
            WHERE b.booking_status = 'confirmed'
            GROUP BY s.show_date
            ORDER BY s.show_date DESC
            LIMIT 30
        `);

        res.json({
            users: parseInt(usersCount.rows[0].count),
            movies: parseInt(moviesCount.rows[0].count),
            bookings: parseInt(bookingsCount.rows[0].count),
            revenue: parseFloat(revenue.rows[0].sum || 0).toFixed(2),
            movieStats: movieStatsHandler.rows,
            dailyStats: dailyStatsHandler.rows
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
