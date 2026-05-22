import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useWorkout } from '../../hooks/useWorkout';
import { useExercises } from '../../hooks/useExercises';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { SetRow } from './SetRow';

function ProgressDots({ total, current, t, isIron }) {
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6,
          height: 6,
          borderRadius: isIron ? 2 : 999,
          background: i === current ? t.accent : (i < current ? t.accentSoft : t.border),
          transition: 'width .2s, background .2s',
        }} />
      ))}
    </div>
  );
}

export function ActiveWorkout() {
  const { tokens: t } = useTheme();
  const navigate = useNavigate();
  const isIron = t.key === 'iron';

  const {
    activeLog, exIdx, currentPlan,
    updateSet, addSet, nextExercise, prevExercise,
    finishWorkout, getPrevSets,
  } = useWorkout();

  const { getById } = useExercises();
  const [confirmFinish, setConfirmFinish] = useState(false);

  if (!activeLog) return null;

  const exercises = activeLog.exercises ?? [];
  const exData = exercises[exIdx];
  const exerciseInfo = getById(exData?.exerciseId);
  const prevSets = getPrevSets(exData?.exerciseId);
  const isLast = exIdx === exercises.length - 1;

  const doneSets = exData?.sets?.filter(s => s.done).length ?? 0;
  const totalSets = exData?.sets?.length ?? 0;

  const planExercise = currentPlan?.exercises?.[exIdx];
  const repHint = planExercise?.repsMin && planExercise?.repsMax
    ? `${planExercise.repsMin}–${planExercise.repsMax} powt.`
    : planExercise?.reps
      ? `${planExercise.reps} powt.`
      : null;

  const handleFinish = async () => {
    await finishWorkout();
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100dvh', background: t.bg,
      display: 'flex', flexDirection: 'column',
      fontFamily: t.fontUI, color: t.ink,
    }}>
      <div style={{
        padding: '52px 20px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <ProgressDots total={exercises.length} current={exIdx} t={t} isIron={isIron} />
        <button
          onClick={() => setConfirmFinish(true)}
          style={{
            fontFamily: t.fontUI, fontSize: 13, fontWeight: 600,
            color: t.inkMute, background: 'none', border: 'none',
            cursor: 'pointer', padding: '8px 0',
          }}
        >
          {isIron ? 'ZAKOŃCZ' : 'Zakończ'}
        </button>
      </div>

      <div style={{ padding: '24px 20px 0', flexShrink: 0 }}>
        <div style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute, marginBottom: 4 }}>
          {exIdx + 1} / {exercises.length}
          {exerciseInfo?.category && ` · ${exerciseInfo.category}`}
        </div>
        <h2 style={{
          fontFamily: t.fontDisplay,
          fontSize: isIron ? 24 : 28,
          fontWeight: isIron ? 700 : 500,
          letterSpacing: isIron ? -0.3 : -0.6,
          lineHeight: 1.1, margin: '0 0 6px', color: t.ink,
          textTransform: isIron ? 'uppercase' : 'none',
        }}>
          {exerciseInfo?.name ?? exData?.exerciseId}
        </h2>
        {(repHint || exerciseInfo?.muscles?.[0]) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {repHint && (
              <span style={{
                fontFamily: t.fontUI, fontSize: 12, color: t.accent,
                background: t.accentTint,
                border: `1px solid ${t.accentSoft}`,
                borderRadius: isIron ? 3 : 8, padding: '2px 8px',
              }}>
                Cel: {repHint}
              </span>
            )}
            {exerciseInfo?.muscles?.slice(0, 2).map(m => (
              <span key={m} style={{
                fontFamily: t.fontUI, fontSize: 12, color: t.inkMute,
                background: t.bgSubtle, border: `1px solid ${t.border}`,
                borderRadius: isIron ? 3 : 8, padding: '2px 8px',
              }}>
                {m}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 0' }}>
        {prevSets && (
          <div style={{
            display: 'flex', gap: 10,
            padding: '8px 12px', marginBottom: 12,
            background: t.bgSubtle,
            border: `1px solid ${t.border}`,
            borderRadius: t.radiusInput,
          }}>
            <Icon name="history" size={14} stroke={2} color={t.inkMute} />
            <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute }}>
              Poprzedni tydzień:&nbsp;
            </span>
            <span style={{ fontFamily: t.fontNum, fontSize: 12, color: t.inkMid }}>
              {prevSets.map(s => `${s.weight ?? '—'}×${s.reps ?? '—'}`).join('  ')}
            </span>
          </div>
        )}

        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '0 0 8px',
          borderBottom: `1px solid ${t.border}`,
          marginBottom: 4,
        }}>
          <span style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkFaint, width: 28 }}>#</span>
          {prevSets && (
            <span style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkFaint, width: 64, textAlign: 'center' }}>Poprz.</span>
          )}
          <span style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkFaint, marginLeft: prevSets ? 10 : 0 }}>Ciężar</span>
          <span style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkFaint, marginLeft: 40 }}>Powt.</span>
        </div>

        {(exData?.sets ?? []).map((s, si) => (
          <SetRow
            key={si}
            setIndex={si}
            set={s}
            prevSet={prevSets?.[si] ?? null}
            onUpdate={(updates) => updateSet(exIdx, si, updates)}
          />
        ))}

        <button
          onClick={() => addSet(exIdx)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            marginTop: 8, padding: '10px 0',
            background: 'none', border: 'none',
            fontFamily: t.fontUI, fontSize: 13, color: t.inkMute,
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="plus" size={16} stroke={2.5} />
          Dodaj serię
        </button>
      </div>

      <div style={{
        padding: '16px 20px',
        paddingBottom: 'calc(16px + 65px + env(safe-area-inset-bottom, 0px))',
        borderTop: `1px solid ${t.border}`,
        background: t.bg,
        display: 'flex', gap: 10, flexShrink: 0,
      }}>
        <button
          onClick={prevExercise}
          disabled={exIdx === 0}
          style={{
            width: 48, height: 52,
            borderRadius: isIron ? 4 : 14,
            background: t.surface,
            border: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: exIdx === 0 ? 'default' : 'pointer',
            opacity: exIdx === 0 ? 0.35 : 1,
            flexShrink: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="chevL" size={20} stroke={2.2} color={t.ink} />
        </button>

        <Button
          variant="accent"
          size="lg"
          onClick={isLast ? () => setConfirmFinish(true) : nextExercise}
          style={{ flex: 1 }}
        >
          {isLast
            ? (isIron ? 'ZAKOŃCZ TRENING' : 'Zakończ trening')
            : (isIron ? 'NASTĘPNE' : 'Następne ćwiczenie')}
          {!isLast && <Icon name="chevR" size={18} stroke={2.2} />}
        </Button>
      </div>

      {confirmFinish && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'flex-end',
          zIndex: 100,
        }}>
          <div style={{
            width: '100%',
            background: t.surface,
            borderRadius: `${t.radiusCard} ${t.radiusCard} 0 0`,
            padding: '28px 20px',
            paddingBottom: 'calc(28px + env(safe-area-inset-bottom, 0px))',
          }}>
            <h3 style={{
              fontFamily: t.fontDisplay,
              fontSize: isIron ? 20 : 24,
              fontWeight: isIron ? 700 : 500,
              color: t.ink, margin: '0 0 8px',
              textTransform: isIron ? 'uppercase' : 'none',
            }}>
              Zakończyć trening?
            </h3>
            <p style={{ fontFamily: t.fontUI, fontSize: 14, color: t.inkMid, margin: '0 0 24px', lineHeight: 1.45 }}>
              Ukończone serie zostaną zapisane.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button variant="accent" size="lg" onClick={handleFinish} style={{ width: '100%' }}>
                <Icon name="check" size={18} stroke={2.5} />
                {isIron ? 'TAK, ZAKOŃCZ' : 'Tak, zakończ'}
              </Button>
              <Button variant="ghost" size="md" onClick={() => setConfirmFinish(false)} style={{ width: '100%' }}>
                {isIron ? 'WRÓĆ DO TRENINGU' : 'Wróć do treningu'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
