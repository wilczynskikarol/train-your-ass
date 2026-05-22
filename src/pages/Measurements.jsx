import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useMeasurements } from '../hooks/useMeasurements';
import { Screen } from '../components/ui/Screen';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

const FIELDS = [
  { key: 'weight', label: 'Waga', unit: 'kg' },
  { key: 'neck', label: 'Szyja', unit: 'cm' },
  { key: 'chest', label: 'Klatka', unit: 'cm' },
  { key: 'waist', label: 'Talia', unit: 'cm' },
  { key: 'hips', label: 'Biodra', unit: 'cm' },
  { key: 'bicep', label: 'Biceps', unit: 'cm' },
  { key: 'thigh', label: 'Udo', unit: 'cm' },
];

function MeasurementForm({ onSave, t, isIron }) {
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);

  const handleChange = (key, raw) => {
    const val = raw.replace(',', '.');
    setValues(prev => ({ ...prev, [key]: val === '' ? undefined : Number(val) }));
  };

  const handleSave = async () => {
    const filled = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined && !isNaN(v)));
    if (!Object.keys(filled).length) return;
    setSaving(true);
    await onSave(filled);
    setValues({});
    setSaving(false);
  };

  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radiusCard,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowSm,
      padding: '16px 18px 18px',
      marginBottom: 24,
    }}>
      <div style={{
        fontFamily: t.fontUI, fontSize: 11, fontWeight: 700,
        color: t.inkMute, marginBottom: 14,
        textTransform: 'uppercase', letterSpacing: '0.06em',
      }}>
        Nowy wpis
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {FIELDS.map(({ key, label, unit }) => (
          <div key={key}>
            <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginBottom: 4 }}>
              {label} ({unit})
            </div>
            <input
              type="number"
              inputMode="decimal"
              placeholder="—"
              value={values[key] ?? ''}
              onChange={e => handleChange(key, e.target.value)}
              style={{
                width: '100%', height: 42, boxSizing: 'border-box',
                background: t.bgSubtle, border: `1px solid ${t.border}`,
                borderRadius: t.radiusInput,
                fontFamily: t.fontNum, fontSize: 15, fontWeight: 600,
                color: t.ink, textAlign: 'center', outline: 'none',
                WebkitAppearance: 'none',
              }}
            />
          </div>
        ))}
      </div>
      <Button
        variant="accent" size="md"
        onClick={handleSave} disabled={saving}
        style={{ width: '100%', marginTop: 14 }}
      >
        {isIron ? 'ZAPISZ POMIARY' : 'Zapisz pomiary'}
      </Button>
    </div>
  );
}

function MeasurementRow({ entry, onDelete, t, isIron }) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dateStr = entry.date?.toDate
    ? entry.date.toDate().toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' })
    : '—';

  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radiusCard,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowSm,
      padding: '14px 16px',
      marginBottom: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute }}>{dateStr}</span>
        {confirmDelete ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => onDelete(entry.id)}
              style={{ fontFamily: t.fontUI, fontSize: 12, color: t.warn, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Usuń
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Anuluj
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 4 }}
          >
            <Icon name="trash" size={15} stroke={2} />
          </button>
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {FIELDS.map(({ key, label, unit }) =>
          entry[key] != null ? (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontFamily: t.fontNum, fontSize: 16, fontWeight: 700, color: t.ink }}>
                {entry[key]}
              </span>
              <span style={{ fontFamily: t.fontUI, fontSize: 10, color: t.inkMute }}>
                {label}
              </span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

export function Measurements() {
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';
  const { history: measurements, loading, save, remove } = useMeasurements();

  return (
    <Screen>
      <div style={{ padding: '52px 20px 0' }}>
        <h1 style={{
          fontFamily: t.fontDisplay,
          fontSize: isIron ? 28 : 34,
          fontWeight: isIron ? 700 : 500,
          letterSpacing: isIron ? -0.5 : -0.8,
          lineHeight: 1.1, margin: '0 0 24px',
          color: t.ink,
          textTransform: isIron ? 'uppercase' : 'none',
        }}>
          Pomiary
        </h1>

        <MeasurementForm onSave={save} t={t} isIron={isIron} />

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <div style={{
              width: 32, height: 32,
              border: `2px solid ${t.border}`,
              borderTopColor: t.accent,
              borderRadius: '50%',
              animation: 'tya-spin 0.7s linear infinite',
            }} />
            <style>{`@keyframes tya-spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : measurements.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '40px 0', color: t.inkMute,
          }}>
            <Icon name="ruler" size={36} stroke={1.3} />
            <p style={{ fontFamily: t.fontUI, fontSize: 14, marginTop: 12, textAlign: 'center' }}>
              Brak pomiarów — dodaj pierwszy powyżej
            </p>
          </div>
        ) : (
          measurements.map(entry => (
            <MeasurementRow
              key={entry.id}
              entry={entry}
              onDelete={remove}
              t={t}
              isIron={isIron}
            />
          ))
        )}
      </div>
    </Screen>
  );
}
