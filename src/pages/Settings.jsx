import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, TOKENS } from '../contexts/ThemeContext';
import { Screen } from '../components/ui/Screen';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { ReportGenerator } from '../components/report/ReportGenerator';

const ACCENTS_SOFT = [
  { key: null, label: 'Honey', color: '#c98a4b' },
  { key: 'mauve', label: 'Mauve', color: '#a87c8f' },
  { key: 'sage', label: 'Sage', color: '#8a9a7b' },
];

const ACCENTS_IRON = [
  { key: null, label: 'White', color: '#f5f5f5' },
  { key: 'green', label: 'Green', color: '#2bd96c' },
  { key: 'orange', label: 'Orange', color: '#ff6b1a' },
  { key: 'blue', label: 'Blue', color: '#3a86ff' },
];

function Row({ label, children, t }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px',
      borderBottom: `1px solid ${t.border}`,
    }}>
      <span style={{ fontFamily: t.fontUI, fontSize: 14, color: t.ink }}>{label}</span>
      {children}
    </div>
  );
}

function Section({ title, children, t, isIron }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontFamily: t.fontUI, fontSize: 11, fontWeight: 700,
        color: t.inkMute, marginBottom: 8, paddingLeft: 4,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        {title}
      </div>
      <div style={{
        background: t.surface,
        borderRadius: t.radiusCard,
        border: `1px solid ${t.border}`,
        boxShadow: t.shadowSm,
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, accent, tokens: t, setTheme } = useTheme();
  const isIron = t.key === 'iron';

  const accents = theme === 'iron' ? ACCENTS_IRON : ACCENTS_SOFT;

  return (
    <Screen>
      <div style={{ padding: '52px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkMid, padding: 4 }}
          >
            <Icon name="arrowL" size={22} stroke={2} />
          </button>
          <h1 style={{
            fontFamily: t.fontDisplay,
            fontSize: isIron ? 24 : 28,
            fontWeight: isIron ? 700 : 500,
            letterSpacing: isIron ? -0.3 : -0.6,
            margin: 0, color: t.ink,
            textTransform: isIron ? 'uppercase' : 'none',
          }}>
            Ustawienia
          </h1>
        </div>

        <Section title="Eksport" t={t} isIron={isIron}>
          <div style={{ padding: '0' }}>
            <ReportGenerator />
          </div>
        </Section>

        <Section title="Wygląd" t={t} isIron={isIron}>
          <Row label="Motyw" t={t}>
            <div style={{ display: 'flex', gap: 8 }}>
              {['soft', 'iron'].map(k => (
                <button
                  key={k}
                  onClick={() => setTheme(k, null)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: isIron ? 4 : 999,
                    background: theme === k ? t.accent : t.bgSubtle,
                    border: `1px solid ${theme === k ? t.accent : t.border}`,
                    color: theme === k ? (isIron ? '#0b0b0c' : '#fff') : t.inkMid,
                    fontFamily: t.fontUI, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  {k === 'soft' ? 'Soft' : 'Iron'}
                </button>
              ))}
            </div>
          </Row>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.border}` }}>
            <span style={{ fontFamily: t.fontUI, fontSize: 14, color: t.ink }}>Akcent</span>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              {accents.map(({ key, label, color }) => (
                <button
                  key={String(key)}
                  onClick={() => setTheme(theme, key)}
                  title={label}
                  style={{
                    width: 36, height: 36,
                    borderRadius: isIron ? 6 : 999,
                    background: color,
                    border: accent === key
                      ? `3px solid ${t.ink}`
                      : `2px solid transparent`,
                    cursor: 'pointer', flexShrink: 0,
                    outline: accent === key ? `2px solid ${t.bg}` : 'none',
                    outlineOffset: -4,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                />
              ))}
            </div>
          </div>
        </Section>

        <Section title="Konto" t={t} isIron={isIron}>
          <div style={{ padding: '14px 18px', borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontFamily: t.fontUI, fontSize: 14, color: t.ink }}>{user?.displayName}</div>
            <div style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute, marginTop: 2 }}>{user?.email}</div>
          </div>
          <div style={{ padding: '4px 18px' }}>
            <button
              onClick={signOut}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 0',
                background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: t.fontUI, fontSize: 14, color: t.warn,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <Icon name="arrowL" size={16} stroke={2} />
              {isIron ? 'WYLOGUJ' : 'Wyloguj się'}
            </button>
          </div>
        </Section>

        <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkFaint, textAlign: 'center', marginTop: 8, paddingBottom: 20 }}>
          TrainYourAss
        </div>
      </div>
    </Screen>
  );
}
