const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get reviews for a movie
router.get('/:movieId', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT r.*, u.first_name, u.last_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.movie_id = $1 ORDER BY r.created_at DESC',
            [req.params.movieId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a review (Protected)
router.post('/', auth, async (req, res) => {
    const { movie_id, rating, review_text } = req.body;

    if (!rating || !movie_id) {
        return res.status(400).json({ msg: 'Rating and Movie ID required' });
    }

    try {
        // Check if user already reviewed? 
        // Unique constraint in doc: UNIQUE KEY unique_user_movie_review (user_id, movie_id)
        // We'll let DB throw error or check.

        const newReview = await pool.query(
            'INSERT INTO reviews (user_id, movie_id, rating, review_text) VALUES ($1, $2, $3, $4) RETURNING *',
            [req.user.id, movie_id, rating, review_text]
        );

        // Return full review with user name? Or just the row. 
        // Frontend creates optimistic or refetches.
        res.json(newReview.rows[0]);
    } catch (err) {
        console.error(err.message);
        if (err.code === '23505') { // Unique violation
            return res.status(400).json({ msg: 'You have already reviewed this movie' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
