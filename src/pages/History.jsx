import { useEffect, useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useExercises } from '../hooks/useExercises';
import {
  getWeekLogs, getISOWeekId, getPrevWeekId, getWeekLabel,
  updateWorkoutLog, deleteWorkoutLog, addWorkoutLogToWeek,
} from '../firebase/helpers';
import { Screen } from '../components/ui/Screen';
import { Icon } from '../components/ui/Icon';

function SetChip({ set, t, isIron }) {
  const isCardio = set.duration !== undefined;
  if (!isCardio && !set.weight && !set.reps) return null;
  if (isCardio && !set.duration && !set.speed) return null;

  const label = isCardio
    ? `${set.duration ?? '—'}min${set.speed ? ` @${set.speed}km/h` : ''}${set.incline ? ` ${set.incline}%` : ''}`
    : `${set.weight ?? '—'}×${set.reps ?? '—'}`;

  return (
    <span style={{
      fontFamily: t.fontNum, fontSize: 12,
      color: set.done ? t.ink : t.inkMute,
      background: set.done ? t.accentTint : t.bgSubtle,
      border: `1px solid ${set.done ? t.accentSoft : t.border}`,
      borderRadius: isIron ? 3 : 8,
      padding: '2px 7px',
    }}>
      {label}
    </span>
  );
}

function LogCard({ log, weekId, uid, t, isIron, getById, onDelete, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editExercises, setEditExercises] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const doneSets = (log.exercises ?? []).reduce((acc, ex) =>
    acc + (ex.sets ?? []).filter(s => s.done).length, 0);

  const logDate = (log.activityDate ?? log.date)?.toDate?.();
  const dateStr = logDate ? logDate.toISOString().slice(0, 10) : '';

  const openEdit = () => {
    setEditDate(dateStr);
    setEditExercises(JSON.parse(JSON.stringify(log.exercises ?? [])));
    setConfirmDel(false);
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setConfirmDel(false);
  };

  const saveEdit = async () => {
    if (!editDate) return;
    setSaving(true);
    try {
      const newDate = new Date(editDate + 'T12:00:00');
      const newWeekId = getISOWeekId(newDate);
      const activityDate = Timestamp.fromDate(newDate);

      if (newWeekId !== weekId) {
        const { id: _id, ...logData } = log;
        await addWorkoutLogToWeek(uid, newWeekId, {
          ...logData,
          exercises: editExercises,
          activityDate,
        });
        await deleteWorkoutLog(uid, weekId, log.id);
        onDelete(log.id);
      } else {
        await updateWorkoutLog(uid, weekId, log.id, { exercises: editExercises, activityDate });
        onUpdate(log.id, { ...log, exercises: editExercises, activityDate });
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteWorkoutLog(uid, weekId, log.id);
      onDelete(log.id);
    } finally {
      setSaving(false);
    }
  };

  const updateSet = (exIdx, setIdx, field, val) => {
    setEditExercises(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[exIdx].sets[setIdx][field] = val === '' ? '' : (isNaN(Number(val)) ? val : Number(val));
      return next;
    });
  };

  const removeSet = (exIdx, setIdx) => {
    setEditExercises(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next[exIdx].sets = next[exIdx].sets.filter((_, i) => i !== setIdx);
      return next;
    });
  };

  const addSet = (exIdx) => {
    setEditExercises(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const ex = next[exIdx];
      const last = ex.sets[ex.sets.length - 1];
      const isCardio = last?.duration !== undefined;
      ex.sets.push(isCardio
        ? { duration: '', speed: '', incline: '', done: false }
        : { weight: '', reps: '', done: false });
      return next;
    });
  };

  const inp = {
    fontFamily: t.fontNum, fontSize: 14,
    background: t.bgSubtle, border: `1px solid ${t.border}`,
    borderRadius: t.radiusInput, color: t.ink,
    padding: '6px 8px', outline: 'none',
    width: 62, textAlign: 'center',
  };

  const iconBtnBase = {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '6px 12px', borderRadius: isIron ? 3 : 8,
    border: `1px solid ${t.border}`, background: 'none',
    cursor: 'pointer', fontFamily: t.fontUI, fontSize: 12,
    color: t.inkMid, WebkitTapHighlightColor: 'transparent',
  };

  const spinner = (
    <div style={{
      width: 14, height: 14,
      border: `2px solid currentColor`,
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'tya-spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );

  return (
    <div style={{
      background: t.surface, borderRadius: t.radiusCard,
      border: `1px solid ${t.border}`, boxShadow: t.shadowSm,
      marginBottom: 10, overflow: 'hidden',
    }}>
      <button
        onClick={() => { if (!editing) setOpen(v => !v); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '14px 16px',
          background: 'none', border: 'none', cursor: editing ? 'default' : 'pointer',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: isIron ? 4 : 9,
            background: log.completed ? t.accentTint : t.bgSubtle,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: log.completed ? t.accent : t.inkMute,
            flexShrink: 0,
          }}>
            {log.completed
              ? <Icon name="check" size={16} stroke={2.5} />
              : <Icon name="barbell" size={16} stroke={2} />
            }
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{
              fontFamily: t.fontDisplay,
              fontSize: isIron ? 14 : 15,
              fontWeight: isIron ? 700 : 500,
              color: t.ink,
              textTransform: isIron ? 'uppercase' : 'none',
            }}>
              Trening {log.planId}
            </div>
            <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginTop: 1 }}>
              {(() => {
                const d = (log.activityDate ?? log.date)?.toDate?.();
                const ds = d ? `${String(d.getDate()).padStart(2,'0')}.${String(d.getMonth()+1).padStart(2,'0')}.${d.getFullYear()} · ` : '';
                return `${ds}${doneSets} serii ukończonych`;
              })()}
            </div>
          </div>
        </div>
        {!editing && <Icon name={open ? 'chevU' : 'chevD'} size={16} stroke={2} color={t.inkFaint} />}
      </button>

      {open && !editing && (
        <div style={{ padding: '0 16px 14px', borderTop: `1px solid ${t.border}` }}>
          {(log.exercises ?? []).map((ex, ei) => {
            const info = getById(ex.exerciseId);
            return (
              <div key={ei} style={{ paddingTop: 12 }}>
                <div style={{ fontFamily: t.fontUI, fontSize: 13, fontWeight: 500, color: t.inkMid, marginBottom: 6 }}>
                  {info?.name ?? ex.exerciseId}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(ex.sets ?? []).map((s, si) => (
                    <SetChip key={si} set={s} t={t} isIron={isIron} />
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ borderTop: `1px solid ${t.border}`, marginTop: 14, paddingTop: 12 }}>
            {confirmDel ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: t.fontUI, fontSize: 13, color: t.ink, flex: 1 }}>
                  Usunąć trening?
                </span>
                <button
                  onClick={handleDelete}
                  disabled={saving}
                  style={{ ...iconBtnBase, borderColor: t.warn, color: t.warn }}
                >
                  {saving ? spinner : 'Usuń'}
                </button>
                <button onClick={() => setConfirmDel(false)} style={iconBtnBase}>
                  Anuluj
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={openEdit} style={iconBtnBase}>
                  <Icon name="edit" size={14} stroke={2} />
                  Edytuj
                </button>
                <button
                  onClick={() => setConfirmDel(true)}
                  style={{ ...iconBtnBase, color: t.warn, borderColor: t.warn }}
                >
                  <Icon name="trash" size={14} stroke={2} />
                  Usuń
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {editing && (
        <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${t.border}` }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
              Data treningu
            </div>
            <input
              type="date"
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              style={{
                fontFamily: t.fontNum, fontSize: 14,
                background: t.bgSubtle, border: `1px solid ${t.border}`,
                borderRadius: t.radiusInput, color: t.ink,
                padding: '8px 10px', outline: 'none', width: '100%',
              }}
            />
          </div>

          {editExercises.map((ex, exIdx) => {
            const info = getById(ex.exerciseId);
            return (
              <div key={exIdx} style={{ marginBottom: 14 }}>
                <div style={{ fontFamily: t.fontUI, fontSize: 13, fontWeight: 500, color: t.inkMid, marginBottom: 8 }}>
                  {info?.name ?? ex.exerciseId}
                </div>
                {ex.sets.map((set, setIdx) => {
                  const isCardio = set.duration !== undefined;
                  return (
                    <div key={setIdx} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      {isCardio ? (
                        <>
                          <input
                            inputMode="decimal"
                            value={set.duration ?? ''}
                            onChange={e => updateSet(exIdx, setIdx, 'duration', e.target.value)}
                            placeholder="min"
                            style={inp}
                          />
                          <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute }}>min</span>
                          <input
                            inputMode="decimal"
                            value={set.speed ?? ''}
                            onChange={e => updateSet(exIdx, setIdx, 'speed', e.target.value)}
                            placeholder="km/h"
                            style={inp}
                          />
                          <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute }}>km/h</span>
                        </>
                      ) : (
                        <>
                          <input
                            inputMode="decimal"
                            value={set.weight ?? ''}
                            onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                            placeholder="kg"
                            style={inp}
                          />
                          <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute }}>×</span>
                          <input
                            inputMode="decimal"
                            value={set.reps ?? ''}
                            onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                            placeholder="pow"
                            style={inp}
                          />
                        </>
                      )}
                      <button
                        onClick={() => removeSet(exIdx, setIdx)}
                        style={{
                          width: 28, height: 28,
                          borderRadius: isIron ? 3 : 7,
                          background: 'none', border: `1px solid ${t.border}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', color: t.inkMute, flexShrink: 0,
                          WebkitTapHighlightColor: 'transparent',
                        }}
                      >
                        <Icon name="x" size={12} stroke={2.5} />
                      </button>
                    </div>
                  );
                })}
                <button
                  onClick={() => addSet(exIdx)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: isIron ? 3 : 7,
                    border: `1px dashed ${t.border}`, background: 'none',
                    cursor: 'pointer', fontFamily: t.fontUI, fontSize: 12,
                    color: t.inkMute, marginTop: 2,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <Icon name="plus" size={12} stroke={2.5} />
                  Seria
                </button>
              </div>
            );
          })}

          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              onClick={saveEdit}
              disabled={saving || !editDate}
              style={{
                flex: 1, padding: '10px 0',
                borderRadius: isIron ? 3 : 10,
                background: t.accent, border: 'none',
                color: '#fff', fontFamily: t.fontUI,
                fontSize: 14, fontWeight: isIron ? 700 : 500,
                cursor: saving ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: saving ? 0.7 : 1,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {saving ? spinner : 'Zapisz'}
            </button>
            <button
              onClick={cancelEdit}
              disabled={saving}
              style={{
                flex: 1, padding: '10px 0',
                borderRadius: isIron ? 3 : 10,
                background: 'none', border: `1px solid ${t.border}`,
                color: t.ink, fontFamily: t.fontUI,
                fontSize: 14, cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              Anuluj
            </button>
          </div>
        </div>
      )}
      <style>{`@keyframes tya-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function History() {
  const { user } = useAuth();
  const { tokens: t } = useTheme();
  const isIron = t.key === 'iron';
  const { getById } = useExercises();

  const [weekId, setWeekId] = useState(getISOWeekId());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getWeekLogs(user.uid, weekId).then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, [user, weekId]);

  const goPrev = () => setWeekId(w => getPrevWeekId(w));
  const goNext = () => {
    const cur = getISOWeekId();
    if (weekId !== cur) {
      const [yr, wk] = weekId.split('-W').map(Number);
      const next = wk === 52 ? `${yr + 1}-W01` : `${yr}-W${String(wk + 1).padStart(2, '0')}`;
      setWeekId(next);
    }
  };

  const isCurrent = weekId === getISOWeekId();

  const handleDelete = (logId) => {
    setLogs(prev => prev.filter(l => l.id !== logId));
  };

  const handleUpdate = (logId, updated) => {
    setLogs(prev => prev.map(l => l.id === logId ? { ...updated } : l));
  };

  return (
    <Screen>
      <div style={{ padding: '52px 20px 0' }}>
        <h1 style={{
          fontFamily: t.fontDisplay,
          fontSize: isIron ? 28 : 34,
          fontWeight: isIron ? 700 : 500,
          letterSpacing: isIron ? -0.5 : -0.8,
          lineHeight: 1.1, margin: '0 0 20px',
          color: t.ink,
          textTransform: isIron ? 'uppercase' : 'none',
        }}>
          Historia
        </h1>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 20,
        }}>
          <button
            onClick={goPrev}
            style={{
              width: 38, height: 38,
              borderRadius: isIron ? 4 : 10,
              background: t.surface, border: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon name="chevL" size={18} stroke={2} color={t.inkMid} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: t.fontDisplay, fontSize: isIron ? 16 : 18, fontWeight: isIron ? 700 : 500, color: t.ink }}>
              {getWeekLabel(weekId)}
            </div>
            <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute }}>
              {weekId}
            </div>
          </div>

          <button
            onClick={goNext}
            disabled={isCurrent}
            style={{
              width: 38, height: 38,
              borderRadius: isIron ? 4 : 10,
              background: t.surface, border: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: isCurrent ? 'default' : 'pointer',
              opacity: isCurrent ? 0.3 : 1,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon name="chevR" size={18} stroke={2} color={t.inkMid} />
          </button>
        </div>

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
        ) : logs.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '60px 0', color: t.inkMute,
          }}>
            <Icon name="history" size={40} stroke={1.3} />
            <p style={{ fontFamily: t.fontUI, fontSize: 14, marginTop: 14, color: t.inkMute, textAlign: 'center' }}>
              Brak treningów w tym tygodniu
            </p>
          </div>
        ) : (
          logs.map(log => (
            <LogCard
              key={log.id}
              log={log}
              weekId={weekId}
              uid={user.uid}
              t={t}
              isIron={isIron}
              getById={getById}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))
        )}
      </div>
    </Screen>
  );
}
