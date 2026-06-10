/**
 * Authenticated API client — for admin panel use only.
 * Attaches JWT token and redirects to /login on 401.
 *
 * The public scan page (/vehicle/:id) uses publicApi.ts instead,
 * which never attaches a token and never redirects.
 */
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach JWT token to every admin request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('qr_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear session and redirect — but ONLY if not on the public scan page
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      !window.location.pathname.startsWith('/vehicle/')
    ) {
      localStorage.removeItem('qr_token');
      localStorage.removeItem('qr_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
