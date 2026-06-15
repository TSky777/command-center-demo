import { C } from '../theme';

// Generic, dependency-free logo mark. Swap for an <img> if you have a real logo.
export default function Logo({ size = 56, radius = 12 }) {
  return (
    <div className="header-logo" style={{
      width: size, height: size, borderRadius: radius,
      background: `linear-gradient(150deg, ${C.accent}, #a78bfa)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24" fill="none">
        <path d="M4 14l4-4 4 3 5-6 3 2" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="20" cy="9" r="1.6" fill="#fff" />
      </svg>
    </div>
  );
}
