// Central API configuration for frontend
// Uses environment variable in production and sensible defaults in development.

export const API_BASE =
  import.meta.env.VITE_API_BASE ||
  (import.meta.env.DEV
    ? 'http://localhost:5000'
    : 'https://youtube-clone-g26r.onrender.com');

export const apiUrl = (path) => {
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return `${API_BASE}${path}`;
};

