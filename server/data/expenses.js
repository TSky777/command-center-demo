// ─── In-memory expense store (demo) ───
// No database required. Expenses live in memory and are pre-seeded with a
// realistic sample list. Changes persist until the server restarts, which is
// exactly what you want for a sales demo. To make edits durable, swap this
// module for a real database table (the route handlers don't care where the
// data comes from).

let nextId = 1;
const seed = (name, amount, frequency, category) => ({
  id: nextId++,
  name,
  amount,
  frequency,
  category,
  start_date: null,
  end_date: null,
  created_at: new Date().toISOString(),
});

let expenses = [
  seed('Shopify Plan', 79, 'monthly', 'Software'),
  seed('Email & SMS Platform', 350, 'monthly', 'Marketing'),
  seed('Reviews App', 49, 'monthly', 'Software'),
  seed('Shipping Boxes & Mailers', 620, 'monthly', 'Packaging'),
  seed('Warehouse / 3PL', 1800, 'monthly', 'Shipping'),
  seed('Influencer Retainer', 1200, 'monthly', 'Marketing'),
  seed('Accounting Software', 35, 'monthly', 'Software'),
  seed('Trade Show Booth', 2400, 'one-time', 'Marketing'),
];

function list() {
  return [...expenses].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

function create({ name, amount, frequency = 'monthly', category = 'Other', start_date, end_date }) {
  const row = {
    id: nextId++,
    name,
    amount: parseFloat(amount),
    frequency,
    category,
    start_date: start_date || null,
    end_date: end_date || null,
    created_at: new Date().toISOString(),
  };
  expenses.push(row);
  return row;
}

function update(id, patch) {
  const row = expenses.find((e) => e.id === Number(id));
  if (!row) return null;
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.amount !== undefined) row.amount = parseFloat(patch.amount);
  if (patch.frequency !== undefined) row.frequency = patch.frequency;
  if (patch.category !== undefined) row.category = patch.category;
  if (patch.start_date !== undefined) row.start_date = patch.start_date || null;
  if (patch.end_date !== undefined) row.end_date = patch.end_date || null;
  return row;
}

function remove(id) {
  const before = expenses.length;
  expenses = expenses.filter((e) => e.id !== Number(id));
  return expenses.length < before;
}

module.exports = { list, create, update, remove };
