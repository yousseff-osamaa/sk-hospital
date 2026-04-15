export const environment = {
  production: true,
  // Vercel proxies /api/* → https://skuh-backend.onrender.com/api/* (see vercel.json)
  // This avoids browser mixed-content errors (HTTPS page → HTTP backend)
  apiUrl: '/api',
};
