require('dotenv').config();

console.log('Environment Variables Check:');
console.log('POSTGRES_USER:', process.env.POSTGRES_USER || 'MISSING');
console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST || 'MISSING');
console.log('POSTGRES_DATABASE:', process.env.POSTGRES_DATABASE || 'MISSING');
console.log('POSTGRES_PASSWORD type:', typeof process.env.POSTGRES_PASSWORD);
console.log('POSTGRES_PASSWORD defined:', !!process.env.POSTGRES_PASSWORD);

if (!process.env.POSTGRES_PASSWORD) {
    console.log('WARNING: POSTGRES_PASSWORD is not defined!');
}
