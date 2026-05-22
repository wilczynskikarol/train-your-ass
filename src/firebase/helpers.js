import { db } from './config';
import {
  doc, collection, setDoc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, serverTimestamp, Timestamp,
} from 'firebase/firestore';

// ── Ustawienia użytkownika ───────────────────────────────────

export const getUserSettings = (uid) =>
  getDoc(doc(db, 'users', uid, 'settings', 'prefs')).then(s => s.data() ?? null);

export const saveUserSettings = (uid, data) =>
  setDoc(doc(db, 'users', uid, 'settings', 'prefs'), data, { merge: true });

// ── Plany treningowe ─────────────────────────────────────────

export const getWorkoutPlans = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'workoutPlans'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const saveWorkoutPlan = (uid, planId, data) =>
  setDoc(doc(db, 'users', uid, 'workoutPlans', planId), data, { merge: false });

// ── Logi treningowe ──────────────────────────────────────────

export const getWorkoutLog = async (uid, weekId, planId) => {
  const snap = await getDocs(
    query(
      collection(db, 'users', uid, 'workoutLogs', weekId, 'logs'),
      where('planId', '==', planId),
      limit(1),
    )
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
};

export const createWorkoutLog = (uid, weekId, data, activityDate) =>
  addDoc(collection(db, 'users', uid, 'workoutLogs', weekId, 'logs'), {
    ...data,
    date: serverTimestamp(),
    activityDate: activityDate ? Timestamp.fromDate(activityDate) : null,
    completed: false,
    status: 'in_progress',
  });

export const getInProgressLog = async (uid, weekId) => {
  const snap = await getDocs(
    query(
      collection(db, 'users', uid, 'workoutLogs', weekId, 'logs'),
      where('completed', '==', false),
      limit(1),
    )
  );
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
};

export const updateWorkoutLog = (uid, weekId, logId, data) =>
  updateDoc(doc(db, 'users', uid, 'workoutLogs', weekId, 'logs', logId), data);

export const getWeekLogs = async (uid, weekId) => {
  const snap = await getDocs(
    collection(db, 'users', uid, 'workoutLogs', weekId, 'logs')
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getExerciseHistory = async (uid, exerciseId, weeksBack = 8) => {
  const results = [];
  const currentWeek = getISOWeekId();
  let weekId = currentWeek;
  for (let i = 0; i < weeksBack; i++) {
    const logs = await getWeekLogs(uid, weekId);
    for (const log of logs) {
      const exData = log.exercises?.find(e => e.exerciseId === exerciseId);
      if (exData) results.push({ weekId, planId: log.planId, sets: exData.sets });
    }
    weekId = getPrevWeekId(weekId);
  }
  return results;
};

// ── Pomiary ──────────────────────────────────────────────────

export const getMeasurements = async (uid, limitCount = 30) => {
  const snap = await getDocs(
    query(
      collection(db, 'users', uid, 'measurements'),
      orderBy('date', 'desc'),
      limit(limitCount),
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const saveMeasurement = (uid, data) =>
  addDoc(collection(db, 'users', uid, 'measurements'), {
    ...data,
    date: serverTimestamp(),
  });

export const deleteMeasurement = (uid, measurementId) =>
  deleteDoc(doc(db, 'users', uid, 'measurements', measurementId));

// ── Własne ćwiczenia ─────────────────────────────────────────

export const getCustomExercises = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'customExercises'));
  return snap.docs.map(d => ({ id: d.id, ...d.data(), custom: true }));
};

export const addCustomExercise = (uid, data) =>
  addDoc(collection(db, 'users', uid, 'customExercises'), { ...data, custom: true });

export const updateCustomExercise = (uid, id, data) =>
  updateDoc(doc(db, 'users', uid, 'customExercises', id), data);

export const deleteCustomExercise = (uid, id) =>
  deleteDoc(doc(db, 'users', uid, 'customExercises', id));

export const getExerciseNotes = async (uid) => {
  const snap = await getDocs(collection(db, 'users', uid, 'exerciseNotes'));
  const map = {};
  snap.docs.forEach(d => { map[d.id] = d.data().notes ?? ''; });
  return map;
};

export const saveExerciseNote = (uid, exerciseId, notes) =>
  setDoc(doc(db, 'users', uid, 'exerciseNotes', String(exerciseId)), { notes }, { merge: true });

// ── Helpers: tygodnie ISO ────────────────────────────────────

export const getISOWeekId = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

export const getPrevWeekId = (weekId) => {
  const [yr, wk] = weekId.split('-W').map(Number);
  if (wk === 1) return `${yr - 1}-W52`;
  return `${yr}-W${String(wk - 1).padStart(2, '0')}`;
};

export const getWeekLabel = (weekId) => {
  const [, wk] = weekId.split('-W');
  return `Tydzień ${Number(wk)}`;
};

export const getLogsForDateRange = async (uid, fromDate, toDate) => {
  const weekIds = new Set();
  const d = new Date(fromDate);
  const end = new Date(toDate);
  while (d <= end) {
    weekIds.add(getISOWeekId(d));
    d.setDate(d.getDate() + 7);
  }
  weekIds.add(getISOWeekId(end));
  const all = [];
  for (const weekId of weekIds) {
    const weekLogs = await getWeekLogs(uid, weekId);
    for (const log of weekLogs) {
      const logDate = log.date?.toDate?.() ?? null;
      if (!logDate) continue;
      if (logDate >= fromDate && logDate <= end) {
        all.push({ ...log, _date: logDate });
      }
    }
  }
  return all.sort((a, b) => a._date - b._date);
};

export const getMeasurementsForDateRange = async (uid, fromDate, toDate) => {
  const snap = await getDocs(
    query(
      collection(db, 'users', uid, 'measurements'),
      where('date', '>=', fromDate),
      where('date', '<=', toDate),
      orderBy('date', 'asc'),
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};
