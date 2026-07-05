'use strict';

// ─── Admin tool: create a new client account ───
// Run on the server: node server/scripts/create-client.js
// Prompts for everything needed to onboard one client (login + their Shopify store).

require('dotenv').config();
const readline = require('readline');
const bcrypt = require('bcryptjs');
const clients = require('../data/clients');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log('--- New Command Center client account ---\n');

  const username = (await ask('Login username (e.g. coffeeco): ')).trim();
  const password = (await ask('Login password: ')).trim();
  const businessName = (await ask('Business name (shown in the app, optional): ')).trim();
  const shopifyShop = (await ask('Shopify shop domain, e.g. my-store.myshopify.com (leave blank for demo data): ')).trim();
  const shopifyToken = shopifyShop ? (await ask('Shopify Admin API token (shpat_...): ')).trim() : '';
  const metaDaily = parseFloat((await ask('Average daily Meta ad spend $ (default 0): ')).trim() || '0');
  const googleDaily = parseFloat((await ask('Average daily Google ad spend $ (default 0): ')).trim() || '0');
  const cogsPercent = parseFloat((await ask('COGS as % of revenue (default 30): ')).trim() || '30');
  const gatewayPercent = parseFloat((await ask('Payment gateway fee % (default 2.9): ')).trim() || '2.9');
  const vertical = (await ask('Industry vertical (coffee/supplements/fashion/beauty/pets/home, default general): ')).trim() || 'general';

  rl.close();

  if (!username || !password) {
    console.error('\nUsername and password are required. Aborting.');
    process.exit(1);
  }

  if (clients.findByUsername(username)) {
    console.error(`\nA client with username "${username}" already exists. Aborting.`);
    process.exit(1);
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const client = clients.create({
    username, passwordHash, businessName,
    shopifyShop: shopifyShop || null,
    shopifyToken: shopifyToken || null,
    metaSpendDaily: metaDaily, googleSpendDaily: googleDaily,
    cogsPercent, gatewayPercent, vertical,
  });

  console.log(`\nCreated client #${client.id}: ${client.username}${client.business_name ? ' (' + client.business_name + ')' : ''}`);
  console.log(client.shopify_shop ? `Connected to Shopify store: ${client.shopify_shop}` : 'No Shopify store connected — this account will see demo data until one is added.');
}

main();
