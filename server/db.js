const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: String(process.env.POSTGRES_HOST || '').trim() || 'localhost',
    database: process.env.POSTGRES_DATABASE,
    password: String(process.env.POSTGRES_PASSWORD || '').trim(),
    port: 5432,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test the connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database');
    release();
});

module.exports = pool;
