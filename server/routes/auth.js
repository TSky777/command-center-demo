const { Router } = require('express');

const router = Router();

// ─── Demo authentication ───
// This is a DEMO gate, not real security. It hands back a demo admin profile
// so the dashboard opens without Google OAuth, databases, or user management.
// Before selling to a real business, replace this with proper auth
// (Google OAuth, email magic links, Auth0, etc.) and per-tenant accounts.

const DEMO_USER = {
  name: 'Demo Admin',
  email: 'demo@democo.example',
  role: 'admin',
  picture: null,
};

// Used by the "Enter Demo" button.
router.post('/demo', (req, res) => {
  res.json(DEMO_USER);
});

// Used by ?key= bookmark links — any key opens the demo.
router.get('/token', (req, res) => {
  res.json(DEMO_USER);
});

module.exports = router;
