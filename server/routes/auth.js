'use strict';

const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const clients = require('../data/clients');
const { JWT_SECRET } = require('../middleware/auth');

const router = Router();

// ─── Demo authentication ───
// This is a DEMO gate, not real security. It hands back a demo admin profile
// so the public marketing demo opens without a real account.
const DEMO_USER = {
  name: 'Demo Admin',
  email: 'demo@democo.example',
  role: 'admin',
  picture: null,
  vertical: 'supplements',
};

router.post('/demo', (req, res) => {
  res.json(DEMO_USER);
});

router.get('/token', (req, res) => {
  res.json(DEMO_USER);
});

// ─── Real client login ───
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const client = clients.findByUsername(username);
  if (!client || !bcrypt.compareSync(password, client.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = jwt.sign({ id: client.id, username: client.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({
    token,
    user: {
      name: client.business_name || client.username,
      username: client.username,
      role: 'client',
      hasShopify: !!(client.shopify_shop && client.shopify_token),
      vertical: client.vertical || 'general',
    },
  });
});

module.exports = router;
