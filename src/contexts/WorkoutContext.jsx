import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import {
  getWorkoutPlans, saveWorkoutPlan,
  getWorkoutLog, createWorkoutLog, updateWorkoutLog,
  getISOWeekId, getPrevWeekId,
} from '../firebase/helpers';

const WorkoutContext = createContext(null);

const DEFAULT_PLANS = [
  { id: 'A', name: 'Trening A', exercises: [] },
  { id: 'B', name: 'Trening B', exercises: [] },
  { id: 'C', name: 'Trening C', exercises: [] },
];

export function WorkoutProvider({ children }) {
  const { user } = useAuth();
  const [plans, setPlans]               = useState(DEFAULT_PLANS);
  const [plansLoading, setPlansLoading] = useState(true);
  const [activeLog, setActiveLog]       = useState(null);
  const [logRef, setLogRef]             = useState(null);
  const [exIdx, setExIdx]               = useState(0);
  const [prevLog, setPrevLog]           = useState(null);
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!user) return;
    getWorkoutPlans(user.uid).then(loaded => {
      if (loaded.length) {
        const sorted = ['A', 'B', 'C'].map(id =>
          loaded.find(p => p.id === id) ?? DEFAULT_PLANS.find(p => p.id === id)
        );
        setPlans(sorted);
      }
      setPlansLoading(false);
    });
  }, [user?.uid]);

  const savePlan = useCallback(async (planId, data) => {
    if (!user) return;
    await saveWorkoutPlan(user.uid, planId, data);
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, ...data } : p));
  }, [user]);

  const startWorkout = useCallback(async (planId) => {
    if (!user) return;
    const plan = plans.find(p => p.id === planId);
    if (!plan || !plan.exercises?.length) return;

    const weekId     = getISOWeekId();
    const prevWeekId = getPrevWeekId(weekId);

    let existing = await getWorkoutLog(user.uid, weekId, planId);
    let logId;

    if (existing) {
      logId = existing.id;
      setActiveLog(existing);
    } else {
      const logData = {
        planId,
        weekId,
        exercises: plan.exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          sets: Array.from({ length: ex.sets }, () => ({
            reps: null, weight: null, done: false,
          })),
        })),
      };
      const ref = await createWorkoutLog(user.uid, weekId, logData);
      logId = ref.id;
      setActiveLog({ id: logId, ...logData });
    }

    const prev = await getWorkoutLog(user.uid, prevWeekId, planId);
    setPrevLog(prev);
    setLogRef({ weekId, logId });
    setExIdx(0);
  }, [user, plans]);

  const persistLog = useCallback((log, ref) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (user && ref) {
        updateWorkoutLog(user.uid, ref.weekId, ref.logId, {
          exercises: log.exercises,
        });
      }
    }, 800);
  }, [user]);

  const updateSet = useCallback((exerciseIdx, setIdx, updates) => {
    setActiveLog(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) =>
        ei !== exerciseIdx ? ex : {
          ...ex,
          sets: ex.sets.map((s, si) => si !== setIdx ? s : { ...s, ...updates }),
        }
      );
      const next = { ...prev, exercises };
      persistLog(next, logRef);
      return next;
    });
  }, [logRef, persistLog]);

  const addSet = useCallback((exerciseIdx) => {
    setActiveLog(prev => {
      if (!prev) return prev;
      const exercises = prev.exercises.map((ex, ei) =>
        ei !== exerciseIdx ? ex : {
          ...ex,
          sets: [...ex.sets, { reps: null, weight: null, done: false }],
        }
      );
      const next = { ...prev, exercises };
      if (user && logRef) {
        updateWorkoutLog(user.uid, logRef.weekId, logRef.logId, { exercises });
      }
      return next;
    });
  }, [user, logRef]);

  const nextExercise = useCallback(() => {
    if (!activeLog) return;
    setExIdx(i => Math.min(i + 1, activeLog.exercises.length - 1));
  }, [activeLog]);

  const prevExercise = useCallback(() => {
    setExIdx(i => Math.max(0, i - 1));
  }, []);

  const finishWorkout = useCallback(async () => {
    clearTimeout(saveTimer.current);
    if (user && logRef && activeLog) {
      await updateWorkoutLog(user.uid, logRef.weekId, logRef.logId, {
        exercises: activeLog.exercises,
        completed: true,
        completedAt: serverTimestamp(),
      });
    }
    setActiveLog(null);
    setLogRef(null);
    setExIdx(0);
    setPrevLog(null);
  }, [user, logRef, activeLog]);

  const getPrevSets = useCallback((exerciseId) => {
    return prevLog?.exercises?.find(e => e.exerciseId === exerciseId)?.sets ?? null;
  }, [prevLog]);

  const currentPlan = activeLog ? plans.find(p => p.id === activeLog.planId) : null;

  return (
    <WorkoutContext.Provider value={{
      plans, plansLoading, savePlan,
      activeLog, exIdx, currentPlan,
      isActive: !!activeLog,
      startWorkout,
      updateSet, addSet,
      nextExercise, prevExercise,
      finishWorkout,
      getPrevSets,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export const useWorkout = () => useContext(WorkoutContext);
