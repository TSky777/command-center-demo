const { Router } = require('express');
const { getKpis } = require('../data/kpis');

const router = Router();

router.get('/', (req, res) => {
  const { range, start, end } = req.query;
  res.json(getKpis(range, start, end));
});

module.exports = router;
