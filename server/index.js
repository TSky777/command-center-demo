require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');

require('./db'); // creates tables on first boot
const { requireAuth, optionalAuth, JWT_SECRET } = require('./middleware/auth');

if (!JWT_SECRET) {
  console.error('[server] JWT_SECRET is not set — client login will not work. Add it to .env.');
}

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
const ALLOWED_ORIGINS = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['https://risex.ai', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server requests (no origin) and any risex.ai subdomain
    if (!origin || ALLOWED_ORIGINS.includes(origin) || /^https?:\/\/[^/]*risex\.ai$/.test(origin)) {
      cb(null, true);
    } else {
      cb(null, true); // permissive for now — all origins allowed
    }
  },
  credentials: true,
}));
app.use(morgan('short'));
app.use(express.json());

// ─── API Routes ───
app.use('/api/auth', require('./routes/auth'));
app.use('/api/kpis', requireAuth, require('./routes/kpis'));
app.use('/api/charts', requireAuth, require('./routes/charts'));
app.use('/api/seasonal', requireAuth, require('./routes/seasonal'));
app.use('/api/expenses', requireAuth, require('./routes/expenses'));
// optionalAuth: the public marketing demo also calls this route with no
// login — it falls back to demo data inside the route when req.client is unset.
app.use('/api/analysis', optionalAuth, require('./routes/analysis'));

app.post('/api/refresh', requireAuth, (req, res) => {
  res.json({ success: true, message: 'Refreshed' });
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
  console.log(`[server] Command Center running on port ${PORT}`);
  console.log(`[server] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[server] Groq: ${process.env.GROQ_API_KEY ? 'configured' : 'NOT SET'}`);
  console.log(`[server] CORS origin: ${process.env.CORS_ORIGIN || '*'}`);
});
