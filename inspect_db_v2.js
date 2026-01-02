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

        console.log('Inspecting screens table...');
        const res2 = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'screens'
        `);
        console.table(res2.rows);

    } catch (err) {
        console.error('Error inspecting DB:', err);
    } finally {
        pool.end();
    }
}

inspect();
