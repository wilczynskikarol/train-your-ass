import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../ui/Icon';

export function CardioRow({ set, onUpdate }) {
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';
  const isDone = set.done;

  const inputStyle = (active) => ({
    height: 44,
    background: active ? t.accentTint : t.bgSubtle,
    border: `1px solid ${active ? t.accentSoft : t.border}`,
    borderRadius: t.radiusInput,
    fontFamily: t.fontNum, fontSize: 15, fontWeight: 600,
    color: t.ink, textAlign: 'center',
    outline: 'none',
    WebkitAppearance: 'none',
    width: '100%',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    fontFamily: t.fontUI, fontSize: 10, color: t.inkFaint,
    textAlign: 'center', marginBottom: 3,
  };

  return (
    <div style={{
      opacity: isDone ? 0.6 : 1,
      transition: 'opacity .2s',
      padding: '8px 0',
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 2 }}>
          <div style={labelStyle}>Czas (min)</div>
          <input
            type="number"
            inputMode="decimal"
            placeholder="30"
            value={set.duration ?? ''}
            onChange={e => onUpdate({ duration: e.target.value === '' ? null : Number(e.target.value) })}
            style={inputStyle(!isDone)}
            disabled={isDone}
          />
        </div>
        <div style={{ flex: 2 }}>
          <div style={labelStyle}>Maszyna</div>
          <input
            type="text"
            placeholder="np. Bieżnia"
            value={set.machine ?? ''}
            onChange={e => onUpdate({ machine: e.target.value })}
            style={{ ...inputStyle(!isDone), fontFamily: t.fontUI, fontSize: 13, fontWeight: 400, textAlign: 'left', padding: '0 8px' }}
            disabled={isDone}
          />
        </div>
        <div style={{ flex: 1.5 }}>
          <div style={labelStyle}>Prędkość</div>
          <input
            type="number"
            inputMode="decimal"
            placeholder="km/h"
            value={set.speed ?? ''}
            onChange={e => onUpdate({ speed: e.target.value === '' ? null : Number(e.target.value) })}
            style={inputStyle(!isDone)}
            disabled={isDone}
          />
        </div>
        <div style={{ flex: 1.5 }}>
          <div style={labelStyle}>Nachylenie</div>
          <input
            type="number"
            inputMode="decimal"
            placeholder="%"
            value={set.incline ?? ''}
            onChange={e => onUpdate({ incline: e.target.value === '' ? null : Number(e.target.value) })}
            style={inputStyle(!isDone)}
            disabled={isDone}
          />
        </div>
        <button
          onClick={() => onUpdate({ done: !isDone })}
          style={{
            width: 44, height: 44, flexShrink: 0,
            borderRadius: isIron ? 4 : 999,
            background: isDone ? t.accent : 'transparent',
            border: `1.5px solid ${isDone ? t.accent : t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: isDone ? (isIron ? '#0b0b0c' : '#fff') : t.inkMute,
            transition: 'background .15s, border-color .15s',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {isDone && <Icon name="check" size={18} stroke={2.5} />}
        </button>
      </div>
    </div>
  );
}
