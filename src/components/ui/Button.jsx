import { useTheme } from '../../contexts/ThemeContext';

export function Button({ children, variant = 'primary', size = 'md', onClick, disabled, style = {}, ...rest }) {
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';

  const base = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, border: 'none', cursor: disabled ? 'default' : 'pointer',
    fontFamily: t.fontUI, fontWeight: 700,
    borderRadius: isIron ? t.radiusInput : t.radiusPill,
    transition: 'opacity .15s',
    opacity: disabled ? 0.45 : 1,
    letterSpacing: isIron ? '0.06em' : 0,
    textTransform: isIron ? 'uppercase' : 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  const sizes = {
    sm: { height: 36, padding: '0 14px', fontSize: 13 },
    md: { minHeight: 52, padding: '12px 20px', fontSize: 15 },
    lg: { minHeight: 56, padding: '14px 24px', fontSize: 16 },
  };

  const variants = {
    primary: {
      background: t.ink, color: t.bg,
    },
    accent: {
      background: t.accent, color: isIron ? '#0b0b0c' : '#fff',
    },
    ghost: {
      background: 'transparent',
      border: `1px solid ${t.border}`,
      color: t.ink,
    },
    danger: {
      background: 'transparent',
      border: `1px solid ${t.warn}`,
      color: t.warn,
    },
    outline: {
      background: isIron ? t.surfaceAlt : t.surface,
      border: `1px solid ${t.border}`,
      color: t.ink,
      boxShadow: t.shadowSm,
    },
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      {...rest}
    >
      {children}
    </button>
  );
}

// Ikonowy przycisk kółko/kwadrat
export function IconButton({ children, onClick, size = 40, style = {} }) {
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';
  return (
    <button
      onClick={onClick}
      style={{
        width: size, height: size,
        borderRadius: isIron ? 6 : 999,
        background: isIron ? t.surface : t.surface,
        border: `1px solid ${t.border}`,
        color: t.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
