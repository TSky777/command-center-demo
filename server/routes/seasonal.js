const { Router } = require('express');
const router = Router();

router.get('/', (req, res) => {
  const client = req.client;
  const vertical = client?.vertical || 'general';
  const { getSeasonalData } = require('../data/seasonal-demo.js');
  res.json(getSeasonalData(vertical));
});

module.exports = router;
