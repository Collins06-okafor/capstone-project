const pool = require('./db');
pool.query('SELECT * FROM users', (err, res) => {
    if (err) {
        console.error(err);
    } else {
        console.log('Users in DB:');
        res.rows.forEach(user => {
            console.log(`ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}`);
        });
    }
    process.exit();
});
