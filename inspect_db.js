const pool = require('./server/db');

async function inspect() {
    console.log('Inspecting showtimes table...');
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'showtimes'
        `);
        console.table(res.rows);
    } catch (err) {
        console.error('Error inspecting DB:', err);
    } finally {
        pool.end();
    }
}

inspect();
