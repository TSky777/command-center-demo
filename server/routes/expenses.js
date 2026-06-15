const { Router } = require('express');
const store = require('../data/expenses');

const router = Router();

router.get('/', (req, res) => {
  res.json({ expenses: store.list() });
});

router.post('/', (req, res) => {
  const { name, amount } = req.body;
  if (!name || amount === undefined) {
    return res.status(400).json({ error: 'Name and amount are required' });
  }
  res.status(201).json(store.create(req.body));
});

router.put('/:id', (req, res) => {
  const updated = store.update(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Expense not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const ok = store.remove(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Expense not found' });
  res.json({ deleted: true });
});

module.exports = router;
