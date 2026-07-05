const { Router } = require('express');
const router = Router();

router.get('/', async (req, res) => {
  const { range, start, end } = req.query;
  const client = req.client;

  if (client && client.shopify_shop && client.shopify_token) {
    try {
      const { getChartsFromShopify } = require('../data/shopify-charts');
      const data = await getChartsFromShopify(client, range, start, end);
      return res.json(data);
    } catch (err) {
      console.error('[charts] Shopify fetch failed, using demo data:', err.message);
    }
  }

  const { getChartsData } = require('../data/charts-demo');
  res.json(getChartsData(range, start, end));
});

module.exports = router;
