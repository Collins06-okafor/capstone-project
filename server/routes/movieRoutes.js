const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

// Get all movies (with search and filter)
router.get('/', async (req, res) => {
    try {
        const { search, genre } = req.query;
        let query = 'SELECT * FROM movies WHERE 1=1';
        const values = [];
        let paramCount = 1;

        if (search) {
            query += ` AND title ILIKE $${paramCount} `;
            values.push(`%${search}%`);
            paramCount++;
        }

        if (genre) {
            // SQL query for genre if it's a specific string column. 
            // If mixed case, might want ILIKE, but genre usually categorical.
            // Check if 'genre' column exists effectively.
            query += ` AND genre ILIKE $${paramCount} `;
            values.push(`%${genre}%`);
            paramCount++;
        }

        query += ' ORDER BY release_date DESC';

        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get movie details
router.get('/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM movies WHERE id = $1', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Movie not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Create movie (Protected, ideally Admin only)
router.post('/', auth, async (req, res) => {
    // Basic Admin check
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') { // Check role from auth middleware
        return res.status(403).json({ msg: 'Access denied' });
    }

    let { title, genre, playlist_url, release_date, end_date, poster_url, description, duration_min } = req.body;

    // Sanitize dates: empty string to null
    release_date = release_date || null;
    end_date = end_date || null;

    try {
        const result = await pool.query(
            'INSERT INTO movies (title, description, genre, release_date, end_date, poster_url, duration) VALUES ($1, $2, $3, COALESCE($4, NOW()), $5, $6, $7) RETURNING *',
            [title, description, genre, release_date, end_date, poster_url, duration_min]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update movie
router.put('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') return res.status(403).json({ msg: 'Access denied' });
    let { title, genre, description, duration_min, poster_url, release_date, end_date } = req.body;

    // Sanitize dates: empty string to null
    release_date = release_date || null;
    end_date = end_date || null;
    try {
        const result = await pool.query(
            'UPDATE movies SET title=$1, genre=$2, description=$3, duration=$4, poster_url=$5, release_date=$6, end_date=$7 WHERE id=$8 RETURNING *',
            [title, genre, description, duration_min, poster_url, release_date, end_date, req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Delete movie
router.delete('/:id', auth, async (req, res) => {
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') return res.status(403).json({ msg: 'Access denied' });
    try {
        await pool.query('DELETE FROM movies WHERE id = $1', [req.params.id]);
        res.json({ msg: 'Movie removed' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get showtimes for a movie
router.get('/:id/showtimes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM showtimes WHERE movie_id = $1 ORDER BY show_date, show_time', [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
