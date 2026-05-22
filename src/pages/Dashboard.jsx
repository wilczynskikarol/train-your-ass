import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useWorkout } from '../hooks/useWorkout';
import { getWeekLogs, getISOWeekId, getMeasurements } from '../firebase/helpers';
import { Screen } from '../components/ui/Screen';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';

function StatCard({ label, value, unit, accent, t, isIron }) {
  return (
    <div style={{
      flex: 1,
      background: t.surface,
      borderRadius: t.radiusCard,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadowSm,
      padding: '14px 16px',
    }}>
      <div style={{ fontFamily: t.fontUI, fontSize: 11, color: t.inkMute, marginBottom: 4, textTransform: isIron ? 'uppercase' : 'none', letterSpacing: isIron ? '0.05em' : 0 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontFamily: t.fontNum, fontSize: 26, fontWeight: 700, color: accent ? t.accent : t.ink, letterSpacing: -0.5 }}>
          {value ?? '—'}
        </span>
        {unit && (
          <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute }}>{unit}</span>
        )}
      </div>
    </div>
  );
}

function PlanButton({ plan, completed, onClick, t, isIron }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        width: '100%',
        background: t.surface,
        border: `1px solid ${completed ? t.accentSoft : t.border}`,
        borderRadius: t.radiusCard,
        boxShadow: t.shadowSm,
        padding: '16px 18px',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 36, height: 36,
          borderRadius: isIron ? 4 : 10,
          background: completed ? t.accentTint : t.bgSubtle,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: completed ? t.accent : t.inkMute,
        }}>
          {completed
            ? <Icon name="check" size={18} stroke={2.5} />
            : <Icon name="barbell" size={18} stroke={2} />
          }
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{
            fontFamily: t.fontDisplay,
            fontSize: isIron ? 15 : 17,
            fontWeight: isIron ? 700 : 500,
            color: t.ink,
            textTransform: isIron ? 'uppercase' : 'none',
          }}>
            {plan.name}
          </div>
          <div style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMute, marginTop: 1 }}>
            {plan.exercises?.length
              ? `${plan.exercises.length} ćwiczeń`
              : 'Brak ćwiczeń — edytuj plan'}
          </div>
        </div>
      </div>
      <Icon name="chevR" size={18} stroke={2} color={t.inkFaint} />
    </button>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const { tokens: t } = useTheme();
  const navigate = useNavigate();
  const isIron = t.key === 'iron';
  const { plans, plansLoading, isActive, activeLog } = useWorkout();

  const [weekLogs, setWeekLogs] = useState([]);
  const [latestWeight, setLatestWeight] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const weekId = getISOWeekId();
    Promise.all([
      getWeekLogs(user.uid, weekId),
      getMeasurements(user.uid, 1),
    ]).then(([logs, measurements]) => {
      setWeekLogs(logs);
      setLatestWeight(measurements[0]?.weight ?? null);
      setStatsLoading(false);
    });
  }, [user]);

  const completedThisWeek = weekLogs.filter(l => l.completed).length;
  const totalSets = weekLogs.reduce((acc, log) =>
    acc + (log.exercises ?? []).reduce((a, ex) =>
      a + (ex.sets ?? []).filter(s => s.done).length, 0), 0);

  const completedPlanIds = new Set(weekLogs.filter(l => l.completed).map(l => l.planId));

  const displayName = user?.displayName?.split(' ')[0] ?? 'Hej';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Dzień dobry' : hour < 18 ? 'Cześć' : 'Dobry wieczór';

  return (
    <Screen>
      <div style={{ padding: '52px 20px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: t.fontUI, fontSize: 13, color: t.inkMute, marginBottom: 4 }}>
              {greeting},
            </div>
            <h1 style={{
              fontFamily: t.fontDisplay,
              fontSize: isIron ? 28 : 34,
              fontWeight: isIron ? 700 : 500,
              letterSpacing: isIron ? -0.5 : -0.8,
              lineHeight: 1.1, margin: 0, color: t.ink,
              textTransform: isIron ? 'uppercase' : 'none',
            }}>
              {displayName}
            </h1>
          </div>
          <button
            onClick={() => navigate('/settings')}
            style={{
              width: 40, height: 40,
              borderRadius: isIron ? 6 : 999,
              background: t.surface,
              border: `1px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0, marginTop: 4,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon name="settings" size={20} stroke={1.8} color={t.inkMid} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <StatCard label="Treningi" value={statsLoading ? null : completedThisWeek} unit="/ tyg." t={t} isIron={isIron} />
          <StatCard label="Serie" value={statsLoading ? null : totalSets} t={t} isIron={isIron} />
          <StatCard label="Waga" value={latestWeight ?? null} unit="kg" t={t} isIron={isIron} accent />
        </div>

        {isActive && (
          <button
            onClick={() => navigate('/workout')}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', marginTop: 16,
              background: t.accent, color: isIron ? '#0b0b0c' : '#fff',
              border: 'none', borderRadius: t.radiusCard,
              padding: '14px 18px', cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <Icon name="flame" size={20} stroke={2} />
            <span style={{ fontFamily: t.fontUI, fontWeight: 700, fontSize: 15, flex: 1, textAlign: 'left' }}>
              Trening w toku — wróć
            </span>
            <Icon name="chevR" size={18} stroke={2.5} />
          </button>
        )}

        <div style={{ marginTop: 28 }}>
          <div style={{
            fontFamily: t.fontUI, fontSize: 11, fontWeight: 700,
            color: t.inkMute, marginBottom: 12,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Ten tydzień
          </div>
          {plansLoading
            ? null
            : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {plans.map(plan => (
                  <PlanButton
                    key={plan.id}
                    plan={plan}
                    completed={completedPlanIds.has(plan.id)}
                    onClick={() => navigate('/workout', { state: { planId: plan.id } })}
                    t={t}
                    isIron={isIron}
                  />
                ))}
              </div>
            )
          }
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{
            fontFamily: t.fontUI, fontSize: 11, fontWeight: 700,
            color: t.inkMute, marginBottom: 12,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Skróty
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Historia', icon: 'history', path: '/history' },
              { label: 'Pomiary', icon: 'ruler', path: '/measurements' },
              { label: 'Baza ćw.', icon: 'book', path: '/exercises' },
            ].map(({ label, icon, path }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: t.radiusCard, boxShadow: t.shadowSm,
                  padding: '14px 8px', cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <Icon name={icon} size={20} stroke={1.8} color={t.inkMid} />
                <span style={{ fontFamily: t.fontUI, fontSize: 12, color: t.inkMid }}>
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Screen>
  );
}
