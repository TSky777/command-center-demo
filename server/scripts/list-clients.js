'use strict';

// Run on the server: node server/scripts/list-clients.js
require('dotenv').config();
const clients = require('../data/clients');

const rows = clients.list();
if (rows.length === 0) {
  console.log('No clients yet. Create one with: node server/scripts/create-client.js');
} else {
  console.table(rows.map((c) => ({
    id: c.id,
    username: c.username,
    business: c.business_name || '',
    shopify_shop: c.shopify_shop || '(none — demo data)',
    created_at: c.created_at,
  })));
}
