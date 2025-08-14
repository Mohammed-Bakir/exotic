// API Configuration for Exotic E-commerce Platform
const API_BASE_URL = import.meta.env.PROD
    ? 'https://exotic-production.up.railway.app'
    : 'http://localhost:5002';

export { API_BASE_URL };