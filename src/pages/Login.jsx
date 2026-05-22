import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';

export function Login() {
  const { signInWithGoogle } = useAuth();
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';

  return (
    <div style={{
      minHeight: '100dvh',
      background: t.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 32px',
    }}>
      {/* Logo */}
      <div style={{
        width: 56, height: 56,
        borderRadius: isIron ? 12 : 16,
        background: t.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: t.bg, marginBottom: 20,
      }}>
        <Icon name="barbell" size={28} stroke={2} />
      </div>

      <h1 style={{
        fontFamily: t.fontDisplay,
        fontSize: isIron ? 32 : 38,
        fontWeight: isIron ? 700 : 500,
        letterSpacing: isIron ? -0.5 : -1,
        lineHeight: 1.05, margin: 0,
        color: t.ink, textAlign: 'center',
        textTransform: isIron ? 'uppercase' : 'none',
      }}>
        TrainYourAss
      </h1>

      <p style={{
        fontFamily: t.fontUI, fontSize: 15,
        color: t.inkMid, marginTop: 10, marginBottom: 48,
        textAlign: 'center', lineHeight: 1.4, maxWidth: 280,
      }}>
        Śledzenie treningów siłowych. Bez bullshitu.
      </p>

      <Button
        variant="primary"
        size="lg"
        onClick={signInWithGoogle}
        style={{ width: '100%', maxWidth: 320 }}
      >
        {/* Google logo SVG */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.2a10.34 10.34 0 00-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" fill={isIron ? '#000' : '#4285F4'}/>
          <path d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.33A9 9 0 009 18z" fill={isIron ? '#000' : '#34A853'}/>
          <path d="M3.98 10.72A5.4 5.4 0 013.7 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 000 9c0 1.45.35 2.82.96 4.05l3.02-2.33z" fill={isIron ? '#000' : '#FBBC05'}/>
          <path d="M9 3.58c1.32 0 2.5.45 3.44 1.34l2.58-2.58A9 9 0 009 0 9 9 0 00.96 4.95L3.98 7.28C4.68 5.16 6.66 3.58 9 3.58z" fill={isIron ? '#000' : '#EA4335'}/>
        </svg>
        Zaloguj się przez Google
      </Button>

      <p style={{
        fontFamily: t.fontUI, fontSize: 11.5, color: t.inkFaint,
        marginTop: 24, textAlign: 'center',
      }}>
        Dane zapisywane wyłącznie na Twoim koncie
      </p>
    </div>
  );
}
