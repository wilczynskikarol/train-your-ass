import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useExercises } from '../hooks/useExercises';
import { getWeekLogs, getISOWeekId, getPrevWeekId, getWeekLabel } from '../firebase/helpers';
import { Screen } from '../components/ui/Screen';
import { Icon } from '../components/ui/Icon';

function SetChip({ set, t, isIron }) {
  if (!set.weight && !set.reps) return null;
  return (
    <span style={{
      fontFamily: t.fontNum, fontSize: 12,
      color: set.done ? t.ink : t.inkMute,
      background: set.done ? t.accentTint : t.bgSubtle,
      border: `1px solid ${set.done ? t.accentSoft : t.border}`,
      borderRadius: isIron ? 3 : 8,
      padding: '2px 7px',
    }}>
      {set.weight ?? '—'}×{set.reps ?? '—'}
    </span>
  );
}

function LogCard({ log, t, isIron, getById }) {
  const [open, setOpen] = useState(false);
  const doneSets = (log.exercises ?? []).reduce((acc, ex) =>
    acc + (ex.sets ?? []).filter(s => s.done).length, 0);

  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radiusCard,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowSm,
      marginBottom: 10, overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', padding: '14px 16px',
          background: 'none', border: 'none', cursor: 'pointer',
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
              {doneSets} serii ukończonych
            </div>
          </div>
        </div>
        <Icon name={open ? 'chevU' : 'chevD'} size={16} stroke={2} color={t.inkFaint} />
      </button>

      {open && (
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
        </div>
      )}
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
            <LogCard key={log.id} log={log} t={t} isIron={isIron} getById={getById} />
          ))
        )}
      </div>
    </Screen>
  );
}
