const pool = require('./server/db');

async function inspect() {
    console.log('Inspecting theaters table...');
    try {
        const res = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'theaters'
        `);
        console.table(res.rows);

        // Also check if there is a screens table just in case
        const res2 = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'screens'
        `);
        if (res2.rows.length > 0) {
            console.log('Screens table found:');
            console.table(res2.rows);
        }

    } catch (err) {
        console.error('Error inspecting DB:', err);
    } finally {
        pool.end();
    }
}

inspect();
