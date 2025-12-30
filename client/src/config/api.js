// API configuration
console.log('=== Environment Variable Debug ===');
console.log('All import.meta.env:', import.meta.env);
console.log('VITE_API_URL value:', import.meta.env.VITE_API_URL);
console.log('Type of VITE_API_URL:', typeof import.meta.env.VITE_API_URL);

export const API_URL = import.meta.env.VITE_API_URL;

console.log('Final API_URL being used:', API_URL);
console.log('==================================');
