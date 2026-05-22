import { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useWorkout } from '../../hooks/useWorkout';
import { useExercises, CATEGORIES } from '../../hooks/useExercises';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

function ExercisePickerSheet({ onAdd, onClose, t, isIron }) {
  const { filtered, query, setQuery, category, setCategory } = useExercises();
  const [selectedId, setSelectedId] = useState(null);
  const [sets, setSets] = useState(3);
  const [repsMin, setRepsMin] = useState(8);
  const [repsMax, setRepsMax] = useState(12);

  const selectedEx = filtered.find(e => String(e.id) === String(selectedId));

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'flex-end',
      zIndex: 200,
    }}>
      <div style={{
        width: '100%', height: '90dvh',
        background: t.bg,
        borderRadius: `${t.radiusCard} ${t.radiusCard} 0 0`,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '18px 18px 12px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: t.inkMid }}
          >
            <Icon name="x" size={20} stroke={2} />
          </button>
          <span style={{ fontFamily: t.fontDisplay, fontSize: isIron ? 16 : 18, fontWeight: isIron ? 700 : 500, color: t.ink }}>
            {isIron ? 'DODAJ ĆWICZENIE' : 'Dodaj ćwiczenie'}
          </span>
        </div>

        <div style={{ padding: '0 18px 10px', flexShrink: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: t.surface, border: `1px solid ${t.border}`,
            borderRadius: t.radiusInput, padding: '0 12px',
          }}>
            <Icon name="search" size={16} stroke={2} color={t.inkMute} />
            <input
              placeholder="Szukaj ćwiczeń…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                flex: 1, height: 40,
                background: 'none', border: 'none', outline: 'none',
                fontFamily: t.fontUI, fontSize: 14, color: t.ink,
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingTop: 10, paddingBottom: 2 }}>
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
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px' }}>
          {filtered.map(ex => (
            <button
              key={ex.id}
              onClick={() => setSelectedId(String(ex.id) === String(selectedId) ? null : ex.id)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '12px 0',
                background: 'none', border: 'none',
                borderBottom: `1px solid ${t.border}`,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: t.fontUI, fontSize: 14, fontWeight: 500,
                  color: String(ex.id) === String(selectedId) ? t.accent : t.ink,
                }}>
                  {ex.name}
                </div>
                <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginTop: 2 }}>
                  {ex.category} · {ex.muscles?.slice(0, 2).join(', ')}
                </div>
              </div>
              {String(ex.id) === String(selectedId) && (
                <div style={{
                  width: 22, height: 22, borderRadius: isIron ? 4 : 999,
                  background: t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Icon name="check" size={13} stroke={2.5} color={isIron ? '#0b0b0c' : '#fff'} />
                </div>
              )}
            </button>
          ))}
        </div>

        {selectedId && (
          <div style={{
            padding: '16px 18px',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
            borderTop: `1px solid ${t.border}`,
            background: t.surface,
            flexShrink: 0,
          }}>
            <div style={{ fontFamily: t.fontUI, fontSize: 13, fontWeight: 600, color: t.ink, marginBottom: 12 }}>
              {selectedEx?.name}
            </div>
            {selectedEx?.type !== 'cardio' && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginBottom: 4 }}>Serie</div>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={sets}
                    min={1} max={10}
                    onChange={e => setSets(Number(e.target.value))}
                    style={{
                      width: '100%', height: 40,
                      background: t.bgSubtle, border: `1px solid ${t.border}`,
                      borderRadius: t.radiusInput,
                      fontFamily: t.fontNum, fontSize: 16, fontWeight: 600,
                      color: t.ink, textAlign: 'center', outline: 'none',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginBottom: 4 }}>Powt. min</div>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={repsMin}
                    min={1} max={30}
                    onChange={e => setRepsMin(Number(e.target.value))}
                    style={{
                      width: '100%', height: 40,
                      background: t.bgSubtle, border: `1px solid ${t.border}`,
                      borderRadius: t.radiusInput,
                      fontFamily: t.fontNum, fontSize: 16, fontWeight: 600,
                      color: t.ink, textAlign: 'center', outline: 'none',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginBottom: 4 }}>Powt. max</div>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={repsMax}
                    min={1} max={30}
                    onChange={e => setRepsMax(Number(e.target.value))}
                    style={{
                      width: '100%', height: 40,
                      background: t.bgSubtle, border: `1px solid ${t.border}`,
                      borderRadius: t.radiusInput,
                      fontFamily: t.fontNum, fontSize: 16, fontWeight: 600,
                      color: t.ink, textAlign: 'center', outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}
            <Button
              variant="accent"
              size="lg"
              style={{ width: '100%' }}
              onClick={() => {
                if (!selectedEx) return;
                const isCardio = selectedEx.type === 'cardio';
                onAdd({
                  exerciseId: String(selectedEx.id),
                  name: selectedEx.name,
                  type: selectedEx.type ?? 'strength',
                  ...(isCardio ? {} : { sets, repsMin, repsMax }),
                });
              }}
            >
              <Icon name="plus" size={16} stroke={2.5} />
              {isIron ? 'DODAJ DO PLANU' : 'Dodaj do planu'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlanEditor({ planId, onDone }) {
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';
  const { plans, savePlan } = useWorkout();

  const plan = plans.find(p => p.id === planId);
  const [exercises, setExercises] = useState(plan?.exercises ?? []);
  const [name, setName] = useState(plan?.name ?? `Trening ${planId}`);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAdd = (ex) => {
    setExercises(prev => [...prev, ex]);
    setShowPicker(false);
  };

  const handleRemove = (idx) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    setExercises(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await savePlan(planId, { id: planId, name, exercises });
    setSaving(false);
    onDone();
  };

  return (
    <div style={{
      minHeight: '100dvh', background: t.bg,
      fontFamily: t.fontUI, color: t.ink,
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        padding: '52px 20px 16px',
        display: 'flex', alignItems: 'center', gap: 14,
        borderBottom: `1px solid ${t.border}`,
        flexShrink: 0,
      }}>
        <button
          onClick={onDone}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkMid, padding: 4 }}
        >
          <Icon name="arrowL" size={22} stroke={2} />
        </button>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          style={{
            flex: 1,
            fontFamily: t.fontDisplay,
            fontSize: isIron ? 20 : 22,
            fontWeight: isIron ? 700 : 500,
            color: t.ink, background: 'none', border: 'none', outline: 'none',
            textTransform: isIron ? 'uppercase' : 'none',
          }}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
        {exercises.length === 0 && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '48px 0', color: t.inkMute,
          }}>
            <Icon name="barbell" size={36} stroke={1.4} />
            <p style={{ fontFamily: t.fontUI, fontSize: 14, marginTop: 12 }}>
              Brak ćwiczeń — dodaj pierwsze
            </p>
          </div>
        )}

        {exercises.map((ex, idx) => (
          <div key={idx} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 0',
            borderBottom: `1px solid ${t.border}`,
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: t.fontUI, fontSize: 14, fontWeight: 500, color: t.ink }}>
                {ex.name}
              </div>
              <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginTop: 2 }}>
                {ex.type === 'cardio'
                  ? 'Kardio'
                  : `${ex.sets} serie · ${ex.repsMin}–${ex.repsMax} powt.`}
              </div>
            </div>
            <button
              onClick={() => handleMoveUp(idx)}
              disabled={idx === 0}
              style={{
                background: 'none', border: 'none', cursor: idx === 0 ? 'default' : 'pointer',
                color: idx === 0 ? t.inkFaint : t.inkMid, padding: 6,
              }}
            >
              <Icon name="chevU" size={18} stroke={2} />
            </button>
            <button
              onClick={() => handleRemove(idx)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.warn, padding: 6 }}
            >
              <Icon name="trash" size={18} stroke={2} />
            </button>
          </div>
        ))}
      </div>

      <div style={{
        padding: '12px 20px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        borderTop: `1px solid ${t.border}`,
        display: 'flex', flexDirection: 'column', gap: 10,
        flexShrink: 0,
      }}>
        <Button variant="outline" size="md" onClick={() => setShowPicker(true)} style={{ width: '100%' }}>
          <Icon name="plus" size={16} stroke={2.5} />
          {isIron ? 'DODAJ ĆWICZENIE' : 'Dodaj ćwiczenie'}
        </Button>
        <Button variant="accent" size="lg" onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
          {isIron ? 'ZAPISZ PLAN' : 'Zapisz plan'}
        </Button>
      </div>

      {showPicker && (
        <ExercisePickerSheet
          onAdd={handleAdd}
          onClose={() => setShowPicker(false)}
          t={t}
          isIron={isIron}
        />
      )}
    </div>
  );
}
