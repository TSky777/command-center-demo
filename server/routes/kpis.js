const { Router } = require('express');

const router = Router();

router.get('/', async (req, res) => {
  const { range, start, end } = req.query;

  // Use real Shopify data when credentials are present, otherwise serve demo data
  if (process.env.SHOPIFY_SHOP && process.env.SHOPIFY_TOKEN) {
    try {
      const { getKpisFromShopify } = require('../data/shopify-kpis');
      const data = await getKpisFromShopify(range, start, end);
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
