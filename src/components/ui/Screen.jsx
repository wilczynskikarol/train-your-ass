import { useTheme } from '../../contexts/ThemeContext';

// Bazowy kontener ekranu — tło, padding na tab bar
export function Screen({ children, padBottom = 80, className = '', style = {} }) {
  const { tokens: t } = useTheme();
  return (
    <div style={{
      minHeight: '100dvh',
      background: t.bg,
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingBottom: `calc(${padBottom}px + env(safe-area-inset-bottom, 0px))`,
      fontFamily: t.fontUI,
      color: t.ink,
      ...style,
    }} className={className}>
      {children}
    </div>
  );
}
