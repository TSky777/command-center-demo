import { BRAND } from './brand';

// Layout colors use CSS custom properties so dark/light/navy switching is instant.
// Semantic colors (green, red, amber) stay as hex — safe for concatenation.
export const C = {
  bg:        'var(--cc-bg)',
  surface:   'var(--cc-surface)',
  card:      'var(--cc-card)',
  cardHover: 'var(--cc-card-hover)',
  border:    'var(--cc-border)',
  text:      'var(--cc-text)',
  muted:     'var(--cc-muted)',
  dim:       'var(--cc-dim)',
  white:     'var(--cc-strong)',

  accent:     'var(--cc-accent)',
  accentSoft: 'var(--cc-accent-soft)',
  green:      '#22c55e',
  greenSoft:  'rgba(34,197,94,.10)',
  red:        '#ef4444',
  redSoft:    'rgba(239,68,68,.10)',
  amber:      '#f59e0b',
  amberSoft:  'rgba(245,158,11,.10)',
  blue:       '#3b82f6',
  meta:       '#0081fb',
  google:     '#34a853',
};

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  /* ── Dark theme (default) ─────────────────────────────────────── */
  :root, :root[data-theme="dark"] {
    --cc-bg:           #080910;
    --cc-surface:      #0e101f;
    --cc-card:         #131528;
    --cc-card-hover:   #191c32;
    --cc-border:       #20233e;
    --cc-text:         #c4c8e8;
    --cc-muted:        #686b98;
    --cc-dim:          #30345a;
    --cc-strong:       #eceefa;
    --cc-header-bg:    rgba(8,9,16,.92);
    --cc-tabbar-bg:    rgba(8,9,16,.96);
    --cc-shadow:       0 1px 3px rgba(0,0,0,.6), 0 4px 20px rgba(0,0,0,.35);
    --cc-accent:       #6366f1;
    --cc-accent-soft:  rgba(99,102,241,.12);
    --cc-accent-border: rgba(99,102,241,.22);
    --cc-accent-glow:  rgba(99,102,241,.05);
    --cc-tab-inactive: #686b98;
    --cc-tab-active:   #eceefa;
    --cc-header-title: #eceefa;
    --cc-header-sub:   #686b98;
  }

  /* ── Corporate Navy theme ────────────────────────────────────── */
  :root[data-theme="navy"] {
    --cc-bg:           #eef2f7;
    --cc-surface:      #dfe8f2;
    --cc-card:         #ffffff;
    --cc-card-hover:   #f2f7ff;
    --cc-border:       #c4d4e4;
    --cc-text:         #0d1b3e;
    --cc-muted:        #5e819e;
    --cc-dim:          #a8c4d8;
    --cc-strong:       #050f25;
    --cc-header-bg:    rgba(7,16,50,.97);
    --cc-tabbar-bg:    rgba(7,16,50,.99);
    --cc-shadow:       0 1px 3px rgba(10,30,80,.10), 0 4px 20px rgba(10,30,80,.08);
    --cc-accent:       #0891b2;
    --cc-accent-soft:  rgba(8,145,178,.12);
    --cc-accent-border: rgba(8,145,178,.22);
    --cc-accent-glow:  rgba(8,145,178,.05);
    --cc-tab-inactive: rgba(200,225,245,.65);
    --cc-tab-active:   #ffffff;
    --cc-header-title: #ffffff;
    --cc-header-sub:   rgba(200,225,245,.75);
  }

  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  body{font-family:'Outfit','DM Sans',-apple-system,sans-serif;background:var(--cc-bg);color:var(--cc-text);transition:background .2s,color .2s;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
  ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--cc-border);border-radius:3px}
  input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.7)}
  @media(min-width:768px){
    body{font-size:16px}
    main{padding:24px 28px 80px !important}
    .app-header{padding:20px 28px !important}
    .header-logo{width:58px !important;height:58px !important;border-radius:12px !important}
    .header-brand{gap:14px !important}
    .header-title{font-size:24px !important}
    .header-subtitle{font-size:14px !important}
    .header-actions{right:28px !important}
    .header-btn{width:40px !important;height:40px !important;font-size:17px !important;border-radius:9px !important}
    .app-tabbar{top:99px !important}
    .tab-btn{padding:13px 22px !important;font-size:15px !important;gap:7px !important}
    .tab-btn span{font-size:15px !important}
    .date-picker{gap:8px !important}
    .date-btn{padding:7px 16px !important;font-size:14px !important;border-radius:8px !important}
    .date-input{padding:6px 11px !important;font-size:13px !important}
    .metric-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr)) !important;gap:12px !important}
    .metric-grid > div{padding:20px 18px !important;border-radius:14px !important}
    .metric-label{font-size:13px !important}
    .metric-value{font-size:28px !important}
    .metric-badge{font-size:12px !important;padding:2px 7px !important}
  }
  @media(min-width:1024px){
    main{padding:28px 40px 80px !important}
    .app-header{padding:24px 36px !important}
    .header-logo{width:74px !important;height:74px !important;border-radius:14px !important}
    .header-brand{gap:18px !important}
    .header-title{font-size:30px !important}
    .header-subtitle{font-size:16px !important}
    .header-actions{right:36px !important}
    .header-btn{width:46px !important;height:46px !important;font-size:20px !important;border-radius:10px !important}
    .app-tabbar{top:123px !important}
    .tab-btn{padding:16px 32px !important;font-size:18px !important;gap:9px !important}
    .tab-btn span{font-size:18px !important}
    .date-picker{gap:10px !important}
    .date-btn{padding:9px 20px !important;font-size:15px !important;border-radius:9px !important}
    .date-input{padding:7px 14px !important;font-size:15px !important}
    .metric-grid{grid-template-columns:repeat(auto-fill,minmax(240px,1fr)) !important;gap:14px !important}
    .metric-grid > div{padding:24px 22px !important;border-radius:16px !important}
    .metric-label{font-size:14px !important}
    .metric-value{font-size:32px !important}
    .metric-badge{font-size:13px !important;padding:3px 8px !important}
  }
`;
