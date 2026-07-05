'use strict';

const db = require('../db');

function findByUsername(username) {
  return db.prepare('SELECT * FROM clients WHERE username = ?').get(username);
}

function findById(id) {
  return db.prepare('SELECT * FROM clients WHERE id = ?').get(id);
}

function create({ username, passwordHash, businessName, shopifyShop, shopifyToken, metaSpendDaily, googleSpendDaily, cogsPercent, gatewayPercent, vertical }) {
  const result = db.prepare(`
    INSERT INTO clients (username, password_hash, business_name, shopify_shop, shopify_token, meta_spend_daily, google_spend_daily, cogs_percent, gateway_percent, vertical)
    VALUES (@username, @passwordHash, @businessName, @shopifyShop, @shopifyToken, @metaSpendDaily, @googleSpendDaily, @cogsPercent, @gatewayPercent, @vertical)
  `).run({
    username,
    passwordHash,
    businessName: businessName || null,
    shopifyShop: shopifyShop || null,
    shopifyToken: shopifyToken || null,
    metaSpendDaily: metaSpendDaily || 0,
    googleSpendDaily: googleSpendDaily || 0,
    cogsPercent: cogsPercent ?? 30,
    gatewayPercent: gatewayPercent ?? 2.9,
    vertical: vertical || 'general',
  });
  return findById(result.lastInsertRowid);
}

function list() {
  return db.prepare('SELECT id, username, business_name, shopify_shop, created_at FROM clients ORDER BY created_at DESC').all();
}

module.exports = { findByUsername, findById, create, list };
