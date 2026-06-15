// Generates static JSON snapshots of the demo data so the app can run with NO
// server (e.g. on GitHub Pages). Reuses the real server-side generators so the
// static demo and the full-stack demo show identical numbers.
//
//   node tools/gen-static-data.js
//
const fs = require('fs');
const path = require('path');
const { getKpis } = require('../server/data/kpis');
const expenses = require('../server/data/expenses');

const outDir = path.join(__dirname, '..', 'client', 'public', 'demo-data');
fs.mkdirSync(outDir, { recursive: true });

const ranges = ['today', 'yesterday', '7d', '14d', '30d'];
for (const range of ranges) {
  fs.writeFileSync(path.join(outDir, `kpis-${range}.json`), JSON.stringify(getKpis(range), null, 0));
}
fs.writeFileSync(path.join(outDir, 'expenses.json'), JSON.stringify({ expenses: expenses.list() }, null, 0));

console.log(`Wrote ${ranges.length} KPI snapshots + expenses seed to ${outDir}`);
