const { Router } = require('express');

const router = Router();

router.get('/', async (req, res) => {
  const { range, start, end } = req.query;
  const client = req.client;

  // Use real Shopify data when this client has credentials, otherwise demo data
  if (client.shopify_shop && client.shopify_token) {
    try {
      const { getKpisFromShopify } = require('../data/shopify-kpis');
      const data = await getKpisFromShopify(client, range, start, end);
      return res.json(data);
    } catch (err) {
      console.error('[kpis] Shopify fetch failed:', err.message);
      return res.status(502).json({ error: 'Shopify data unavailable', details: err.message });
    }
  }

  const { getKpis } = require('../data/kpis');
  res.json(getKpis(range, start, end));
});

module.exports = router;
