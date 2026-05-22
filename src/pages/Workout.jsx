import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../hooks/useWorkout';
import { Screen } from '../components/ui/Screen';
import { Icon } from '../components/ui/Icon';
import { Button } from '../components/ui/Button';
import { ActiveWorkout } from '../components/workout/ActiveWorkout';
import { PlanEditor } from '../components/workout/PlanEditor';

function StartSheet({ plan, onConfirm, onClose, t, isIron }) {
  const today = new Date().toISOString().split('T')[0];
  const [dateStr, setDateStr] = useState(today);

  const handleStart = () => {
    const date = new Date(dateStr + 'T12:00:00');
    onConfirm(plan.id, date);
  };

  return (
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
        padding: '24px 20px',
        paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{
            fontFamily: t.fontDisplay,
            fontSize: isIron ? 18 : 22,
            fontWeight: isIron ? 700 : 500,
            color: t.ink, margin: 0,
            textTransform: isIron ? 'uppercase' : 'none',
          }}>
            {plan.name}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.inkMid, padding: 4 }}>
            <Icon name="x" size={20} stroke={2} />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginBottom: 6 }}>
            Data treningu
          </div>
          <input
            type="date"
            value={dateStr}
            max={today}
            onChange={e => setDateStr(e.target.value)}
            style={{
              width: '100%', height: 48, boxSizing: 'border-box',
              background: t.bgSubtle, border: `1px solid ${t.border}`,
              borderRadius: t.radiusInput,
              fontFamily: t.fontUI, fontSize: 16,
              color: t.ink, padding: '0 12px', outline: 'none',
              cursor: 'pointer',
            }}
          />
        </div>

        <Button variant="accent" size="lg" onClick={handleStart} style={{ width: '100%' }}>
          <Icon name="barbell" size={16} stroke={2} />
          {isIron ? 'ZACZNIJ TRENING' : 'Zacznij trening'}
        </Button>
      </div>
    </div>
  );
}

function PlanCard({ plan, onStart, onEdit, t, isIron }) {
  const hasExercises = plan.exercises?.length > 0;
  return (
    <div style={{
      background: t.surface,
      borderRadius: t.radiusCard,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowSm,
      overflow: 'hidden',
    }}>
      <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            fontFamily: t.fontDisplay,
            fontSize: isIron ? 16 : 18,
            fontWeight: isIron ? 700 : 500,
            color: t.ink,
            textTransform: isIron ? 'uppercase' : 'none',
            letterSpacing: isIron ? -0.2 : -0.3,
          }}>
            {plan.name}
          </div>
          <div style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute, marginTop: 2 }}>
            {hasExercises ? `${plan.exercises.length} ćwiczeń` : 'Puste — dodaj ćwiczenia'}
          </div>
        </div>
        <button
          onClick={() => onEdit(plan.id)}
          style={{
            width: 34, height: 34,
            borderRadius: isIron ? 4 : 999,
            background: t.bgSubtle,
            border: `1px solid ${t.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <Icon name="edit" size={16} stroke={2} color={t.inkMid} />
        </button>
      </div>

      {hasExercises && (
        <div style={{ padding: '0 18px 12px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {plan.exercises.slice(0, 6).map((ex, i) => (
            <span key={i} style={{
              fontFamily: t.fontUI, fontSize: 11,
              color: t.inkMid,
              background: t.bgSubtle,
              border: `1px solid ${t.border}`,
              borderRadius: isIron ? 3 : 8,
              padding: '3px 8px',
            }}>
              {ex.name ?? ex.exerciseId}
            </span>
          ))}
          {plan.exercises.length > 6 && (
            <span style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, padding: '3px 4px' }}>
              +{plan.exercises.length - 6}
            </span>
          )}
        </div>
      )}

      <div style={{ padding: '0 18px 16px' }}>
        <Button
          variant={hasExercises ? 'accent' : 'ghost'}
          size="md"
          onClick={() => hasExercises ? onStart(plan) : onEdit(plan.id)}
          style={{ width: '100%' }}
        >
          {hasExercises ? (
            <>
              <Icon name="barbell" size={16} stroke={2} />
              {isIron ? 'ZACZNIJ' : 'Zacznij trening'}
            </>
          ) : (
            <>
              <Icon name="plus" size={16} stroke={2.5} />
              {isIron ? 'EDYTUJ PLAN' : 'Edytuj plan'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

export function Workout() {
  const { tokens: t } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isIron = t.key === 'iron';

  const { plans, plansLoading, isActive, startWorkout, createPlan } = useWorkout();
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [starting, setStarting] = useState(false);
  const [startingPlan, setStartingPlan] = useState(null);
  const [creating, setCreating] = useState(false);

  const handleNewPlan = async () => {
    setCreating(true);
    const id = await createPlan(`Trening ${plans.length + 1}`);
    setCreating(false);
    if (id) setEditingPlanId(id);
  };

  useEffect(() => {
    if (location.state?.planId && !isActive && !plansLoading) {
      const plan = plans.find(p => p.id === location.state.planId);
      navigate(location.pathname, { replace: true, state: {} });
      if (plan) setStartingPlan(plan);
    }
  }, [location.state, plansLoading]);

  const handleConfirm = async (planId, date) => {
    setStartingPlan(null);
    setStarting(true);
    await startWorkout(planId, date);
    setStarting(false);
  };

  if (isActive) {
    return <ActiveWorkout />;
  }

  if (editingPlanId) {
    return (
      <PlanEditor
        planId={editingPlanId}
        onDone={() => setEditingPlanId(null)}
      />
    );
  }

  return (
    <Screen>
      <div style={{ padding: '52px 20px 0' }}>
        <h1 style={{
          fontFamily: t.fontDisplay,
          fontSize: isIron ? 28 : 34,
          fontWeight: isIron ? 700 : 500,
          letterSpacing: isIron ? -0.5 : -0.8,
          lineHeight: 1.1, margin: '0 0 6px',
          color: t.ink,
          textTransform: isIron ? 'uppercase' : 'none',
        }}>
          Trening
        </h1>
        <p style={{ fontFamily: t.fontUI, fontSize: 14, color: t.inkMute, margin: '0 0 24px' }}>
          Wybierz plan na dziś
        </p>

        {plansLoading || starting || creating ? (
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {plans.length === 0 && (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '48px 0', color: t.inkMute,
              }}>
                <Icon name="barbell" size={36} stroke={1.4} />
                <p style={{ fontFamily: t.fontUI, fontSize: 14, marginTop: 12, marginBottom: 0 }}>
                  Brak planów — dodaj swój pierwszy
                </p>
              </div>
            )}
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onStart={setStartingPlan}
                onEdit={setEditingPlanId}
                t={t}
                isIron={isIron}
              />
            ))}
            <Button variant="outline" size="md" onClick={handleNewPlan} style={{ width: '100%' }}>
              <Icon name="plus" size={16} stroke={2.5} />
              {isIron ? 'NOWY PLAN' : 'Nowy plan'}
            </Button>
          </div>
        )}
      </div>

      {startingPlan && (
        <StartSheet
          plan={startingPlan}
          onConfirm={handleConfirm}
          onClose={() => setStartingPlan(null)}
          t={t}
          isIron={isIron}
        />
      )}
    </Screen>
  );
}
