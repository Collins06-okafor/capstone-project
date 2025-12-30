const pool = require('./db');

async function checkMovies() {
    try {
        const result = await pool.query('SELECT COUNT(*) FROM movies');
        console.log('Total movies in database:', result.rows[0].count);

        const sample = await pool.query('SELECT * FROM movies LIMIT 5');
        console.log('Sample movies:', JSON.stringify(sample.rows, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('Error checking movies:', err.message);
        process.exit(1);
    }
}

checkMovies();
