import { useTheme } from '../../contexts/ThemeContext';

export function Spinner({ size = 32 }) {
  const { tokens: t } = useTheme();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        width: size, height: size,
        border: `2px solid ${t.border}`,
        borderTopColor: t.accent,
        borderRadius: '50%',
        animation: 'tya-spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes tya-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function FullPageSpinner() {
  const { tokens: t } = useTheme();
  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: t.bg,
    }}>
      <Spinner size={40} />
    </div>
  );
}
