const { Router } = require('express');
const router = Router();

router.get('/', async (req, res) => {
  const client = req.client;
  const vertical = client?.vertical || 'general';

  if (client?.shopify_shop && client?.shopify_token) {
    try {
      const { getSeasonalFromShopify } = require('../data/shopify-seasonal');
      const data = await getSeasonalFromShopify(client);
      return res.json(data);
    } catch (err) {
      console.error('[seasonal] Shopify fetch failed, using demo data:', err.message);
    }
  }

  const { getSeasonalData } = require('../data/seasonal-demo.js');
  res.json(getSeasonalData(vertical));
});

module.exports = router;
