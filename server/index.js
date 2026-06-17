require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
}));
app.use(morgan('short'));
app.use(express.json());

// ─── API Routes ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/kpis', require('./routes/kpis'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/analysis', require('./routes/analysis'));

// Demo refresh — no-op (data is seeded, nothing to sync).
app.post('/api/refresh', (req, res) => {
  res.json({ success: true, message: 'Demo data refreshed' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'demo', time: new Date().toISOString() });
});

// ─── Serve the built React app ───
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[server] Command Center (demo) running on port ${PORT}`);
  console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[server] Groq: ${process.env.GROQ_API_KEY ? 'configured' : 'NOT SET'}`);
  console.log(`[server] CORS origin: ${process.env.CORS_ORIGIN || '*'}`);
});
