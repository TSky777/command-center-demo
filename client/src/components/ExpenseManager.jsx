import { useState } from 'react';
import { C } from '../theme';
import { useExpenses } from '../hooks/useExpenses';

const cats = ['Software', 'Packaging', 'Marketing', 'Shipping', 'Other'];
const freqs = ['monthly', 'weekly', 'daily', 'one-time'];

export default function ExpenseManager() {
  const { data: expenses, loading, add, update, remove } = useExpenses();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', amount: '', frequency: 'monthly', category: 'Software' });
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const totalMonthly = expenses.filter((e) => e.frequency === 'monthly').reduce((s, e) => s + parseFloat(e.amount), 0);
  const totalDaily = (totalMonthly / 30).toFixed(2);

  const handleSave = async () => {
    if (!form.name || !form.amount) return;
    setSaving(true);
    try {
      if (editId) {
        await update(editId, { ...form, amount: parseFloat(form.amount) });
        setEditId(null);
      } else {
        await add({ ...form, amount: parseFloat(form.amount) });
      }
      setForm({ name: '', amount: '', frequency: 'monthly', category: 'Software' });
      setShowForm(false);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (e) => {
    setForm({ name: e.name, amount: String(e.amount), frequency: e.frequency, category: e.category });
    setEditId(e.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try { await remove(id); } catch (err) { alert('Failed to delete: ' + err.message); }
  };

  if (loading) return <div style={{ textAlign: 'center', color: C.muted, padding: 40 }}>Loading expenses...</div>;

  return (
    <div style={{ animation: 'fadeUp .35s ease both' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 7, marginBottom: 16 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 11, padding: '12px 14px' }}>
          <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>Monthly Total</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.red, fontFamily: "'Outfit',sans-serif" }}>${totalMonthly.toLocaleString()}</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 11, padding: '12px 14px' }}>
          <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>Daily Prorated</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.amber, fontFamily: "'Outfit',sans-serif" }}>${totalDaily}</div>
        </div>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 11, padding: '12px 14px' }}>
          <div style={{ fontSize: 9.5, color: C.muted, textTransform: 'uppercase', letterSpacing: '.04em' }}>Total Items</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.white, fontFamily: "'Outfit',sans-serif" }}>{expenses.length}</div>
        </div>
      </div>

      {/* Add Button */}
      <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: '', amount: '', frequency: 'monthly', category: 'Software' }); }} style={{
        background: showForm ? C.surface : C.accentSoft,
        border: `1px solid ${showForm ? C.border : 'rgba(99,91,255,.2)'}`,
        borderRadius: 8, padding: '7px 14px', fontSize: 11, fontWeight: 600,
        color: showForm ? C.muted : C.accent, cursor: 'pointer', fontFamily: 'inherit',
        marginBottom: 12, display: 'block',
      }}>{showForm ? '✕ Cancel' : '+ Add Expense'}</button>

      {/* Form */}
      {showForm && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 11, padding: 16, marginBottom: 14, animation: 'fadeUp .25s ease both' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 12 }}>{editId ? 'Edit Expense' : 'New Expense'}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '2 1 140px' }}>
              <label style={{ fontSize: 9.5, color: C.muted, fontWeight: 500, display: 'block', marginBottom: 3 }}>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Software Subscription"
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 12, color: C.white, outline: 'none', width: '100%', fontFamily: 'inherit' }} />
            </div>
            <div style={{ flex: '1 1 90px' }}>
              <label style={{ fontSize: 9.5, color: C.muted, fontWeight: 500, display: 'block', marginBottom: 3 }}>Amount</label>
              <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="$0.00" type="number"
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 12, color: C.white, fontFamily: 'monospace', outline: 'none', width: '100%' }} />
            </div>
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ fontSize: 9.5, color: C.muted, fontWeight: 500, display: 'block', marginBottom: 3 }}>Frequency</label>
              <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 12, color: C.white, outline: 'none', width: '100%', fontFamily: 'inherit' }}>
                {freqs.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div style={{ flex: '1 1 100px' }}>
              <label style={{ fontSize: 9.5, color: C.muted, fontWeight: 500, display: 'block', marginBottom: 3 }}>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: '6px 10px', fontSize: 12, color: C.white, outline: 'none', width: '100%', fontFamily: 'inherit' }}>
                {cats.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={handleSave} disabled={saving} style={{
              background: C.accent, border: 'none', borderRadius: 6,
              padding: '7px 18px', fontSize: 11, fontWeight: 600, color: '#fff',
              cursor: 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1,
            }}>{saving ? 'Saving...' : editId ? 'Update' : 'Save'}</button>
          </div>
        </div>
      )}

      {/* Expense List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {expenses.map((e, i) => (
          <div key={e.id} style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            animation: `fadeUp .3s ease ${i * 0.03}s both`,
          }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{e.name}</span>
                <span style={{ fontSize: 9, color: C.muted, background: C.surface, padding: '1px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '.03em' }}>{e.category}</span>
              </div>
              <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>
                {e.frequency === 'one-time' ? 'One-time' : `$${(parseFloat(e.amount) / 30).toFixed(2)}/day`}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.white, fontFamily: "'Outfit',monospace" }}>${parseFloat(e.amount).toLocaleString()}</span>
              <span style={{ fontSize: 9, color: C.muted }}>{e.frequency === 'monthly' ? '/mo' : e.frequency === 'weekly' ? '/wk' : e.frequency === 'daily' ? '/day' : ''}</span>
              <button onClick={() => handleEdit(e)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.muted, padding: 2 }}>✎</button>
              <button onClick={() => handleDelete(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: C.red, padding: 2, opacity: 0.6 }}>✕</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16, padding: 14, background: 'rgba(99,91,255,.04)', border: '1px solid rgba(99,91,255,.12)', borderRadius: 10, fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
        <strong style={{ color: C.text }}>How expenses affect your KPIs:</strong> Monthly expenses are auto-prorated to a daily rate and factored into Net Profit, Contribution Margin, and Net Margin calculations.
      </div>
    </div>
  );
}
