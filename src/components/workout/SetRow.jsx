import { useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Icon } from '../ui/Icon';

export function SetRow({ setIndex, set, prevSet, onUpdate, onDelete }) {
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';
  const [sliding, setSliding] = useState(false);
  const startX = useRef(null);

  const isDone = set.done;

  const handleWeightChange = (e) => {
    const val = e.target.value.replace(',', '.');
    onUpdate({ weight: val === '' ? null : Number(val) });
  };

  const handleRepsChange = (e) => {
    const val = e.target.value;
    onUpdate({ reps: val === '' ? null : Number(val) });
  };

  const toggleDone = () => onUpdate({ done: !isDone });

  const inputStyle = (active) => ({
    width: 64, height: 44,
    background: active ? t.accentTint : t.bgSubtle,
    border: `1px solid ${active ? t.accentSoft : t.border}`,
    borderRadius: t.radiusInput,
    fontFamily: t.fontNum, fontSize: 16, fontWeight: 600,
    color: t.ink, textAlign: 'center',
    outline: 'none',
    WebkitAppearance: 'none',
  });

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '6px 0',
      opacity: isDone ? 0.6 : 1,
      transition: 'opacity .2s',
    }}>
      <span style={{
        fontFamily: t.fontNum, fontSize: 12, color: t.inkFaint,
        width: 18, textAlign: 'center', flexShrink: 0,
      }}>
        {setIndex + 1}
      </span>

      {prevSet && (
        <span style={{
          fontFamily: t.fontNum, fontSize: 11, color: t.inkMute,
          width: 54, textAlign: 'center', flexShrink: 0,
        }}>
          {prevSet.weight ?? '—'}×{prevSet.reps ?? '—'}
        </span>
      )}

      <input
        type="number"
        inputMode="decimal"
        placeholder="kg"
        value={set.weight ?? ''}
        onChange={handleWeightChange}
        style={inputStyle(!isDone)}
        disabled={isDone}
      />

      <span style={{ fontFamily: t.fontUI, fontSize: 13, color: t.inkFaint }}>×</span>

      <input
        type="number"
        inputMode="numeric"
        placeholder="reps"
        value={set.reps ?? ''}
        onChange={handleRepsChange}
        style={inputStyle(!isDone)}
        disabled={isDone}
      />

      <div style={{ flex: 1 }} />

      <button
        onClick={toggleDone}
        style={{
          width: 40, height: 40,
          borderRadius: isIron ? 4 : 999,
          background: isDone ? t.accent : 'transparent',
          border: `1.5px solid ${isDone ? t.accent : t.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          color: isDone ? (isIron ? '#0b0b0c' : '#fff') : t.inkMute,
          transition: 'background .15s, border-color .15s',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {isDone && <Icon name="check" size={18} stroke={2.5} />}
      </button>
    </div>
  );
}
