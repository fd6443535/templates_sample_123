// Local bootstrap for the mobile demo server
// Usage: node seed.js

const app = require('./server');

const PORT = process.env.MOBILE_PORT ? Number(process.env.MOBILE_PORT) : 3002;

app.listen(PORT, () => {
  console.log(`Mobile demo server running at http://localhost:${PORT}/mobile/login`);
});
