import { BRAND } from './brand';

export const C = {
  bg: '#050508',
  surface: '#0b0b12',
  card: '#101018',
  cardHover: '#161620',
  border: '#1a1a28',
  accent: BRAND.accent,
  accentSoft: 'rgba(99,91,255,.10)',
  green: '#22c55e',
  greenSoft: 'rgba(34,197,94,.08)',
  red: '#ef4444',
  redSoft: 'rgba(239,68,68,.08)',
  amber: '#eab308',
  amberSoft: 'rgba(234,179,8,.08)',
  blue: '#3b82f6',
  meta: '#0081fb',
  google: '#34a853',
  text: '#d0d0de',
  muted: '#62627a',
  dim: '#363650',
  white: '#efeffa',
};

export const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
  @keyframes slideIn{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
  body{font-family:'Outfit','DM Sans',-apple-system,sans-serif;background:${C.bg};color:${C.text}}
  ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.border};border-radius:2px}
  input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.7)}
  @media(min-width:768px){
    body{font-size:16px}
    main{padding:24px 28px 80px !important}
    .app-header{padding:20px 28px !important}
    .header-logo{width:58px !important;height:58px !important;border-radius:12px !important}
    .header-brand{gap:14px !important}
    .header-title{font-size:24px !important}
    .header-subtitle{font-size:14px !important}
    .header-refresh{right:28px !important;width:40px !important;height:40px !important;font-size:17px !important;border-radius:9px !important}
    .app-tabbar{top:99px !important}
    .tab-btn{padding:13px 22px !important;font-size:15px !important;gap:7px !important}
    .tab-btn span{font-size:15px !important}
    .date-picker{gap:8px !important}
    .date-btn{padding:7px 16px !important;font-size:14px !important;border-radius:8px !important}
    .date-input{padding:6px 11px !important;font-size:13px !important}
    .metric-grid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr)) !important;gap:12px !important}
    .metric-grid > div{padding:20px 18px !important;border-radius:13px !important}
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
    .header-refresh{right:36px !important;width:46px !important;height:46px !important;font-size:20px !important;border-radius:10px !important}
    .app-tabbar{top:123px !important}
    .tab-btn{padding:16px 32px !important;font-size:18px !important;gap:9px !important}
    .tab-btn span{font-size:18px !important}
    .date-picker{gap:10px !important}
    .date-btn{padding:9px 20px !important;font-size:15px !important;border-radius:9px !important}
    .date-input{padding:7px 14px !important;font-size:15px !important}
    .metric-grid{grid-template-columns:repeat(auto-fill,minmax(240px,1fr)) !important;gap:14px !important}
    .metric-grid > div{padding:24px 22px !important;border-radius:14px !important}
    .metric-label{font-size:14px !important}
    .metric-value{font-size:32px !important}
    .metric-badge{font-size:13px !important;padding:3px 8px !important}
  }
`;
