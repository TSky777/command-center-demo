import { C } from '../theme';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', gap: 12,
    }}>
      <div style={{
        width: 32, height: 32, border: `2px solid ${C.border}`,
        borderTopColor: C.accent, borderRadius: '50%',
        animation: 'spin .8s linear infinite',
      }} />
      <div style={{ fontSize: 12, color: C.muted }}>{message}</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '60px 20px', gap: 12,
    }}>
      <div style={{ fontSize: 24 }}>⚠</div>
      <div style={{ fontSize: 12, color: C.red, textAlign: 'center' }}>{message}</div>
      {onRetry && (
        <button onClick={onRetry} style={{
          background: C.surface, border: `1px solid ${C.border}`,
          borderRadius: 6, padding: '6px 14px', fontSize: 11,
          color: C.accent, cursor: 'pointer', fontFamily: 'inherit',
        }}>Retry</button>
      )}
    </div>
  );
}
