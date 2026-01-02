const pool = require('./server/db');

async function run() {
    console.log('Attempting to fix database schema...');
    try {
        // Check if column exists
        const check = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'movies' AND column_name = 'end_date'
        `);

        if (check.rows.length === 0) {
            console.log('Column end_date missing. Adding it...');
            await pool.query('ALTER TABLE movies ADD COLUMN end_date DATE');
            console.log('Successfully added end_date column.');
        } else {
            console.log('Column end_date already exists.');
        }

        // Verify again
        const verify = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'movies' AND column_name = 'end_date'
        `);
        console.log('Verification:', verify.rows);

    } catch (err) {
        console.error('Error fixing database:', err);
    } finally {
        pool.end();
    }
}

run();
