const pool = require('./db');
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);

        const res = await pool.query(
            "UPDATE users SET password = $1 WHERE email = $2 RETURNING *",
            [hashedPassword, 'admin@himovie.com']
        );

        if (res.rows.length > 0) {
            console.log('Success: Password for admin@himovie.com reset to admin123');
        } else {
            console.log('Error: Admin user not found');
        }
        process.exit(0);
    } catch (err) {
        console.error('Error resetting password:', err);
        process.exit(1);
    }
}

resetAdmin();
