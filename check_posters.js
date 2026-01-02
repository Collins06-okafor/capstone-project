const pool = require('./server/db');

async function run() {
    try {
        const res = await pool.query('SELECT id, poster_url FROM movies ORDER BY id DESC LIMIT 5');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

run();
