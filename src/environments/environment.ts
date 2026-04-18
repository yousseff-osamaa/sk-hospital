export const environment = {
  production: true,
  // Vercel proxies /api/* → http://37.27.204.174:8800/api/* (see vercel.json)
  // This avoids browser mixed-content errors (HTTPS page → HTTP backend)
 apiUrl: '/api',

};
