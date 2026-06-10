/**
 * Public API client — NO auth token, NO login redirect.
 * Used exclusively by the scan page (/vehicle/:id).
 * Any user who scans a QR code hits this, no account needed.
 */
import axios from 'axios';

const publicApi = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// No request interceptor — never attach a token
// No response interceptor — never redirect to /login

export default publicApi;
