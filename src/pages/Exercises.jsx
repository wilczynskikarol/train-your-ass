import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useExercises, CATEGORIES } from '../hooks/useExercises';
import { Screen } from '../components/ui/Screen';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

const EQUIPMENT_LABELS = {
  'Sztanga': 'Sztanga',
  'Hantle': 'Hantle',
  'Wyciąg': 'Wyciąg',
  'Maszyna': 'Maszyna',
  'Własna waga': 'BW',
  'Kettlebell': 'KB',
  'Inny': 'Inne',
};

function AddCustomSheet({ onAdd, onClose, t, isIron }) {
  const [form, setForm] = useState({ name: '', category: 'Klatka', muscles: '', equipment: 'Sztanga' });
  const [saving, setSaving] = useState(false);

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onAdd({
      name: form.name.trim(),
      category: form.category,
      muscles: form.muscles.split(',').map(s => s.trim()).filter(Boolean),
      equipment: form.equipment,
    });
    setSaving(false);
    onClose();
  };

  const inputStyle = {
    width: '100%', height: 44, boxSizing: 'border-box',
    background: t.bgSubtle, border: `1px solid ${t.border}`,
    borderRadius: t.radiusInput,
    fontFamily: t.fontUI, fontSize: 14,
    color: t.ink, padding: '0 12px', outline: 'none',
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'flex-end',
      zIndex: 200,
    }}>
      <div style={{
        width: '100%',
        background: t.bg,
        borderRadius: `${t.radiusCard} ${t.radiusCard} 0 0`,
        padding: '20px 20px',
        paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkMid }}>
            <Icon name="x" size={20} stroke={2} />
          </button>
          <span style={{ fontFamily: t.fontDisplay, fontSize: isIron ? 16 : 18, fontWeight: isIron ? 700 : 500, color: t.ink }}>
            {isIron ? 'WŁASNE ĆWICZENIE' : 'Własne ćwiczenie'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginBottom: 5 }}>Nazwa</div>
            <input value={form.name} onChange={set('name')} placeholder="np. Wyciskanie na ławce" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginBottom: 5 }}>Kategoria</div>
            <select value={form.category} onChange={set('category')} style={selectStyle}>
              {CATEGORIES.filter(c => c !== 'Wszystkie').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginBottom: 5 }}>Mięśnie (oddziel przecinkami)</div>
            <input value={form.muscles} onChange={set('muscles')} placeholder="np. Klatka, Triceps" style={inputStyle} />
          </div>
          <div>
            <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginBottom: 5 }}>Sprzęt</div>
            <select value={form.equipment} onChange={set('equipment')} style={selectStyle}>
              {Object.keys(EQUIPMENT_LABELS).map(k => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
        </div>

        <Button
          variant="accent" size="lg"
          onClick={handleSave} disabled={saving || !form.name.trim()}
          style={{ width: '100%', marginTop: 20 }}
        >
          {isIron ? 'DODAJ' : 'Dodaj ćwiczenie'}
        </Button>
      </div>
    </div>
  );
}

function ExerciseRow({ ex, onDelete, t, isIron }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      padding: '12px 0',
      borderBottom: `1px solid ${t.border}`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: t.fontUI, fontSize: 14, fontWeight: 500, color: t.ink }}>
            {ex.name}
          </span>
          {ex.custom && (
            <span style={{
              fontFamily: t.fontUI, fontSize: 10, color: t.accent,
              background: t.accentTint, border: `1px solid ${t.accentSoft}`,
              borderRadius: isIron ? 2 : 5, padding: '1px 5px',
            }}>
              własne
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute }}>{ex.category}</span>
          {ex.muscles?.slice(0, 2).map(m => (
            <span key={m} style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkFaint }}>· {m}</span>
          ))}
          {ex.equipment && (
            <span style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkFaint }}>
              · {EQUIPMENT_LABELS[ex.equipment] ?? ex.equipment}
            </span>
          )}
        </div>
      </div>
      {ex.custom && (
        confirmDelete ? (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button
              onClick={() => onDelete(ex.id)}
              style={{ fontFamily: t.fontUI, fontSize: 12, color: t.warn, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Usuń
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Nie
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkFaint, padding: 4, flexShrink: 0 }}
          >
            <Icon name="trash" size={16} stroke={2} />
          </button>
        )
      )}
    </div>
  );
}

export function Exercises() {
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';
  const { filtered, query, setQuery, category, setCategory, addCustom, removeCustom } = useExercises();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <Screen>
      <div style={{ padding: '52px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h1 style={{
            fontFamily: t.fontDisplay,
            fontSize: isIron ? 28 : 34,
            fontWeight: isIron ? 700 : 500,
            letterSpacing: isIron ? -0.5 : -0.8,
            lineHeight: 1.1, margin: 0,
            color: t.ink,
            textTransform: isIron ? 'uppercase' : 'none',
          }}>
            Baza
          </h1>
          <Button variant="outline" size="sm" onClick={() => setShowAdd(true)}>
            <Icon name="plus" size={15} stroke={2.5} />
            {isIron ? 'DODAJ' : 'Dodaj'}
          </Button>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: t.surface, border: `1px solid ${t.border}`,
          borderRadius: t.radiusInput, padding: '0 12px', marginBottom: 12,
        }}>
          <Icon name="search" size={16} stroke={2} color={t.inkMute} />
          <input
            placeholder="Szukaj ćwiczeń…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, height: 44,
              background: 'none', border: 'none', outline: 'none',
              fontFamily: t.fontUI, fontSize: 14, color: t.ink,
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkMute, padding: 4 }}
            >
              <Icon name="x" size={14} stroke={2} />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 4 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                flexShrink: 0,
                padding: '5px 12px',
                borderRadius: isIron ? 4 : 999,
                background: category === cat ? t.accent : t.surface,
                border: `1px solid ${category === cat ? t.accent : t.border}`,
                color: category === cat ? (isIron ? '#0b0b0c' : '#fff') : t.inkMid,
                fontFamily: t.fontUI, fontSize: 12, fontWeight: 600,
                cursor: 'pointer', whiteSpace: 'nowrap',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginTop: 8, marginBottom: 4 }}>
          {filtered.length} wyników
        </div>

        {filtered.map(ex => (
          <ExerciseRow
            key={ex.id}
            ex={ex}
            onDelete={removeCustom}
            t={t}
            isIron={isIron}
          />
        ))}
      </div>

      {showAdd && (
        <AddCustomSheet
          onAdd={addCustom}
          onClose={() => setShowAdd(false)}
          t={t}
          isIron={isIron}
        />
      )}
    </Screen>
  );
}
