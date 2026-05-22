import { useTheme } from '../../contexts/ThemeContext';

// Bazowy kontener ekranu — tło, padding na tab bar
export function Screen({ children, padBottom = 96, className = '', style = {} }) {
  const { tokens: t } = useTheme();
  return (
    <div style={{
      minHeight: '100dvh',
      background: t.bg,
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingBottom: padBottom,
      fontFamily: t.fontUI,
      color: t.ink,
      ...style,
    }} className={className}>
      {children}
    </div>
  );
}
