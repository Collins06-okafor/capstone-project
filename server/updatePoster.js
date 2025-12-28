const pool = require('./db');

async function updateMatrixPoster() {
    try {
        const res = await pool.query(
            "UPDATE movies SET poster_url = '/uploads/matrix_resurrections.jpg' WHERE title ILIKE '%Matrix Resurrections%' RETURNING *"
        );
        console.log('Updated:', res.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

updateMatrixPoster();
