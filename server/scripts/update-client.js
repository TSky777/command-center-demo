'use strict';

// ─── Admin tool: update an existing client's Shopify credentials / settings ───
// Run on the server: node server/scripts/update-client.js
// Leave any prompt blank to keep its current value.

require('dotenv').config();
const readline = require('readline');
const db = require('../db');
const clients = require('../data/clients');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log('--- Update an existing client ---\n');

  const username = (await ask('Username to update: ')).trim();
  const client = clients.findByUsername(username);
  if (!client) {
    console.error(`No client found with username "${username}".`);
    rl.close();
    process.exit(1);
  }

  console.log(`\nCurrent values for ${client.username} (${client.business_name || 'no business name'}):`);
  console.log(`  shopify_shop:       ${client.shopify_shop || '(none)'}`);
  console.log(`  shopify_token:      ${client.shopify_token ? '(set)' : '(none)'}`);
  console.log(`  meta_spend_daily:   ${client.meta_spend_daily}`);
  console.log(`  google_spend_daily: ${client.google_spend_daily}`);
  console.log(`  cogs_percent:       ${client.cogs_percent}`);
  console.log(`  gateway_percent:    ${client.gateway_percent}`);
  console.log(`  vertical:           ${client.vertical || 'general'}\n`);
  console.log('Press Enter on any field to keep its current value.\n');

  const shopifyShop = (await ask(`Shopify shop domain [${client.shopify_shop || 'none'}]: `)).trim();
  const shopifyToken = (await ask(`Shopify Admin API token [${client.shopify_token ? 'keep current' : 'none'}]: `)).trim();
  const metaDaily = (await ask(`Average daily Meta ad spend $ [${client.meta_spend_daily}]: `)).trim();
  const googleDaily = (await ask(`Average daily Google ad spend $ [${client.google_spend_daily}]: `)).trim();
  const cogsPercent = (await ask(`COGS % [${client.cogs_percent}]: `)).trim();
  const gatewayPercent = (await ask(`Gateway fee % [${client.gateway_percent}]: `)).trim();
  const vertical = (await ask(`Industry vertical [${client.vertical || 'general'}]: `)).trim();

  rl.close();

  db.prepare(`
    UPDATE clients SET
      shopify_shop = @shopifyShop,
      shopify_token = @shopifyToken,
      meta_spend_daily = @metaDaily,
      google_spend_daily = @googleDaily,
      cogs_percent = @cogsPercent,
      gateway_percent = @gatewayPercent,
      vertical = @vertical
    WHERE id = @id
  `).run({
    id: client.id,
    shopifyShop: shopifyShop || client.shopify_shop,
    shopifyToken: shopifyToken || client.shopify_token,
    metaDaily: metaDaily !== '' ? parseFloat(metaDaily) : client.meta_spend_daily,
    googleDaily: googleDaily !== '' ? parseFloat(googleDaily) : client.google_spend_daily,
    cogsPercent: cogsPercent !== '' ? parseFloat(cogsPercent) : client.cogs_percent,
    gatewayPercent: gatewayPercent !== '' ? parseFloat(gatewayPercent) : client.gateway_percent,
    vertical: vertical || client.vertical || 'general',
  });

  console.log(`\nUpdated ${client.username}.`);
}

main();
