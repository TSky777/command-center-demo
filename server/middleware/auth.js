'use strict';

const jwt = require('jsonwebtoken');
const clients = require('../data/clients');

const JWT_SECRET = process.env.JWT_SECRET;

function readClientFromToken(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return clients.findById(payload.id) || null;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const client = readClientFromToken(req);
  if (!client) return res.status(401).json({ error: 'Not authenticated' });
  req.client = client;
  next();
}

// Used by routes the public demo also hits without logging in (e.g. AI
// Analysis on the marketing demo). Attaches req.client when a valid token is
// present; otherwise leaves it undefined so the route can fall back to demo data.
function optionalAuth(req, res, next) {
  req.client = readClientFromToken(req);
  next();
}

module.exports = { requireAuth, optionalAuth, JWT_SECRET };
