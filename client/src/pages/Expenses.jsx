import { C } from '../theme';
import ExpenseManager from '../components/ExpenseManager';

export default function Expenses() {
  return (
    <div style={{ animation: 'fadeUp .3s ease both' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.white, marginBottom: 2 }}>Expense Manager</div>
      <div style={{ fontSize: 11, color: C.muted, marginBottom: 14 }}>Manage recurring & one-time costs. Auto-factored into profit calculations.</div>
      <ExpenseManager />
    </div>
  );
}
