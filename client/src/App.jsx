import { useState, useEffect } from 'react';
import { C, globalStyles } from './theme';
import Header from './components/Header';
import TabBar from './components/TabBar';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import AIAnalysis from './pages/AIAnalysis';
import LoginScreen from './components/LoginScreen';
import { triggerRefresh, clearToken } from './utils/api';

function getStoredUser() {
  try {
    const stored = localStorage.getItem('cc_user');
    if (stored) return JSON.parse(stored);
  } catch {}
  return null;
}

export default function App() {
  const [user, setUser] = useState(getStoredUser);
  const [tab, setTab] = useState('home');
  const [dateRange, setDateRange] = useState('today');
  const [custom, setCustom] = useState({ s: '', e: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [time, setTime] = useState(new Date());
  const [collapsed, setCollapsed] = useState({});

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  // Set default custom dates (last 7 days)
  useEffect(() => {
    if (!custom.s) {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      setCustom({
        s: weekAgo.toISOString().split('T')[0],
        e: now.toISOString().split('T')[0],
      });
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('cc_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleSignOut = () => {
    localStorage.removeItem('cc_user');
    clearToken();
    setUser(null);
    setTab('home');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await triggerRefresh();
    } catch (err) {
      console.error('Refresh failed:', err);
    }
    setTimeout(() => {
      setRefreshing(false);
      setTime(new Date());
    }, 700);
  };

  const toggle = (s) => setCollapsed((c) => ({ ...c, [s]: !c[s] }));

  if (!user) {
    return (
      <div>
        <style>{globalStyles}</style>
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  const now = new Date();
  const dateLabel = {
    today: `Today, ${now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${now.getFullYear()}`,
    yesterday: 'Yesterday',
    '7d': 'Last 7 Days',
    '14d': '14 Days',
    '30d': '30 Days',
    custom: `${custom.s} → ${custom.e}`,
  }[dateRange];


  return (
    <div style={{ background: C.bg, minHeight: '100vh', fontFamily: "'Outfit','DM Sans',-apple-system,sans-serif", color: C.text }}>
      <style>{globalStyles}</style>

      <Header
        dateRange={dateRange}
        dateLabel={dateLabel}
        time={time}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        user={user}
        onSignOut={handleSignOut}
      />

      <TabBar active={tab} onSelect={setTab} />

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '14px 14px 70px' }}>
        {tab === 'home' && (
          <Dashboard
            dateRange={dateRange}
            setDateRange={setDateRange}
            custom={custom}
            setCustom={setCustom}
            collapsed={collapsed}
            toggle={toggle}
          />
        )}
        {tab === 'expenses' && <Expenses />}
        {tab === 'ai' && <AIAnalysis dateRange={dateRange} custom={custom} />}
      </main>
    </div>
  );
}
