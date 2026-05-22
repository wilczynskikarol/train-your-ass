import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme, TOKENS } from '../contexts/ThemeContext';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';

// Karta podglądu motywu
function StyleCard({ tokens: outer, variantKey, selected, onClick }) {
  const v = TOKENS[variantKey];
  const vIsIron = v.key === 'iron';
  const outerIsIron = outer.key === 'iron';
  const names = { soft: 'Soft strength', iron: 'Iron mode' };
  const taglines = {
    soft: 'Spokojny, jasny, ciepły',
    iron: 'Ciemny, mocny, bez dekoracji',
  };
  const descs = {
    soft: 'Elegancka typografia, miękkie krawędzie, oddech między elementami. Czytelny i przyjemny.',
    iron: 'Wysoki kontrast, gruba typografia, twarde krawędzie. Maksymalna czytelność przy ostrym świetle siłowni.',
  };

  return (
    <div
      onClick={onClick}
      style={{
        borderRadius: outer.radiusCard,
        background: outer.surface,
        border: selected
          ? `2px solid ${outer.accent}`
          : `1px solid ${outer.border}`,
        boxShadow: selected ? outer.shadowMd : outer.shadowSm,
        overflow: 'hidden', cursor: 'pointer',
      }}
    >
      {/* Podgląd w kolorach wariantu */}
      <div style={{
        height: 120, background: v.bg, padding: '14px 16px 0',
        borderBottom: `1px solid ${v.border}`, position: 'relative', overflow: 'hidden',
      }}>
        {/* Miniekran aktywnego treningu */}
        <div style={{ fontFamily: v.fontDisplay, fontSize: vIsIron ? 15 : 17, fontWeight: vIsIron ? 700 : 500, color: v.ink }}>
          Wiosłowanie sztangą
        </div>
        <div style={{ fontFamily: v.fontUI, fontSize: 10, color: v.inkMute, marginTop: 2 }}>
          Cel: 12–15 powt. · 4 serie
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
          {[{ kg: 60, r: 14, d: true }, { kg: 60, r: 13, active: true }].map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: 4, alignItems: 'center',
              padding: '4px 8px', borderRadius: v.radiusInput,
              background: s.active ? v.accentTint : (s.d ? v.surfaceAlt : v.surface),
              border: `1px solid ${s.active ? v.accentSoft : v.border}`,
            }}>
              <span style={{ fontFamily: v.fontNum, fontSize: 13, fontWeight: 600, color: v.ink }}>{s.kg}kg</span>
              <span style={{ fontFamily: v.fontNum, fontSize: 13, fontWeight: 600, color: v.ink }}>×{s.r}</span>
              {s.d && <span style={{ color: v.success, fontSize: 11 }}>✓</span>}
            </div>
          ))}
        </div>
        {/* radio dot */}
        <div style={{
          position: 'absolute', top: 12, right: 12,
          width: 22, height: 22,
          borderRadius: outerIsIron ? 4 : 999,
          border: selected ? `2px solid ${outer.accent}` : `1.5px solid ${outer.borderStrong}`,
          background: selected ? outer.accent : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {selected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={outerIsIron ? '#0b0b0c' : '#fff'} strokeWidth="3.5" strokeLinecap="round">
              <path d="M5 12.5l4.5 4.5L19 7"/>
            </svg>
          )}
        </div>
      </div>

      {/* Opis */}
      <div style={{ padding: '14px 18px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{
            fontFamily: outer.fontDisplay, fontSize: 20,
            fontWeight: outerIsIron ? 700 : 500,
            color: outer.ink, letterSpacing: outerIsIron ? -0.2 : -0.4,
          }}>{names[variantKey]}</span>
          <span style={{ fontFamily: outer.fontUI, fontSize: 12, color: outer.inkMid }}>
            · {taglines[variantKey]}
          </span>
        </div>
        <p style={{
          fontFamily: outer.fontUI, fontSize: 12.5, lineHeight: 1.45,
          color: outer.inkMid, margin: '4px 0 0',
        }}>{descs[variantKey]}</p>
      </div>
    </div>
  );
}

export function Onboarding() {
  const { tokens: t, setTheme } = useTheme();
  const navigate = useNavigate();
  const [selected, setSelected] = useState('soft');
  const isIron = t.key === 'iron';

  const confirm = () => {
    setTheme(selected, null);
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100dvh', background: t.bg,
      padding: '0 0 120px', fontFamily: t.fontUI, color: t.ink,
    }}>
      {/* Header */}
      <div style={{ padding: '48px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: isIron ? 4 : 8,
            background: t.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', color: t.bg,
          }}>
            <Icon name="barbell" size={18} stroke={2} />
          </div>
          <span style={{
            fontFamily: t.fontDisplay, fontSize: 16,
            fontWeight: isIron ? 700 : 500,
            textTransform: isIron ? 'uppercase' : 'none',
          }}>TrainYourAss</span>
        </div>
        <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute }}>Krok 1 z 1</span>
      </div>

      {/* Tytuł */}
      <div style={{ padding: '40px 24px 0' }}>
        <h1 style={{
          fontFamily: t.fontDisplay,
          fontSize: isIron ? 32 : 38,
          fontWeight: isIron ? 700 : 500,
          letterSpacing: isIron ? -0.5 : -1, lineHeight: 1.05,
          margin: 0, color: t.ink,
          textTransform: isIron ? 'uppercase' : 'none',
        }}>
          Jak ma wyglądać<br/>twoja aplikacja?
        </h1>
        <p style={{
          fontFamily: t.fontUI, fontSize: 14, color: t.inkMid, lineHeight: 1.45,
          marginTop: 10, maxWidth: 320,
        }}>
          Funkcje są identyczne. Wybierz styl, który do ciebie pasuje — zmienisz go w ustawieniach.
        </p>
      </div>

      {/* Karty motywów */}
      <div style={{ padding: '24px 16px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <StyleCard tokens={t} variantKey="soft" selected={selected === 'soft'} onClick={() => setSelected('soft')} />
        <StyleCard tokens={t} variantKey="iron" selected={selected === 'iron'} onClick={() => setSelected('iron')} />
      </div>

      {/* CTA */}
      <div style={{ padding: '24px 16px 0' }}>
        <Button variant="primary" size="lg" onClick={confirm} style={{ width: '100%' }}>
          {isIron ? 'KONTYNUUJ' : 'Kontynuuj'}
          <Icon name="arrow" size={16} stroke={2.2} />
        </Button>
        <p style={{
          fontFamily: t.fontUI, fontSize: 11.5, color: t.inkMute,
          textAlign: 'center', marginTop: 10,
        }}>
          Możesz zmienić styl w Ustawieniach → Wygląd
        </p>
      </div>
    </div>
  );
}
