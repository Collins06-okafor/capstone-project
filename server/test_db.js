const { Pool } = require('pg');
require('dotenv').config();

console.log('--- DB Connection Test ---');
console.log('User:', process.env.POSTGRES_USER);
console.log('Host:', process.env.POSTGRES_HOST);

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

pool.connect((err, client, release) => {
    if (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
    console.log('Connection successful!');
    release();
    process.exit(0);
});
