'use strict';

// ─── Per-client expense store (SQLite) ───
// Every read/write is scoped to clientId so one client can never see or
// modify another client's expenses.

const db = require('../db');

function list(clientId) {
  return db.prepare('SELECT * FROM expenses WHERE client_id = ? ORDER BY created_at DESC').all(clientId);
}

function create(clientId, { name, amount, frequency = 'monthly', category = 'Other', start_date, end_date }) {
  const result = db.prepare(`
    INSERT INTO expenses (client_id, name, amount, frequency, category, start_date, end_date)
    VALUES (@clientId, @name, @amount, @frequency, @category, @start_date, @end_date)
  `).run({
    clientId, name, amount: parseFloat(amount), frequency, category,
    start_date: start_date || null, end_date: end_date || null,
  });
  return db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
}

function update(clientId, id, patch) {
  const row = db.prepare('SELECT * FROM expenses WHERE id = ? AND client_id = ?').get(id, clientId);
  if (!row) return null;

  const next = {
    name: patch.name !== undefined ? patch.name : row.name,
    amount: patch.amount !== undefined ? parseFloat(patch.amount) : row.amount,
    frequency: patch.frequency !== undefined ? patch.frequency : row.frequency,
    category: patch.category !== undefined ? patch.category : row.category,
    start_date: patch.start_date !== undefined ? (patch.start_date || null) : row.start_date,
    end_date: patch.end_date !== undefined ? (patch.end_date || null) : row.end_date,
  };

  db.prepare(`
    UPDATE expenses SET name = @name, amount = @amount, frequency = @frequency,
      category = @category, start_date = @start_date, end_date = @end_date
    WHERE id = @id AND client_id = @clientId
  `).run({ ...next, id, clientId });

  return db.prepare('SELECT * FROM expenses WHERE id = ?').get(id);
}

function remove(clientId, id) {
  const result = db.prepare('DELETE FROM expenses WHERE id = ? AND client_id = ?').run(id, clientId);
  return result.changes > 0;
}

module.exports = { list, create, update, remove };
