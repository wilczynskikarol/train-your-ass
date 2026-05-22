import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMeasurements, saveMeasurement, deleteMeasurement } from '../firebase/helpers';

export const MEASUREMENT_FIELDS = [
  { key: 'weight', label: 'Waga',   unit: 'kg' },
  { key: 'neck',   label: 'Szyja',  unit: 'cm' },
  { key: 'chest',  label: 'Klatka', unit: 'cm' },
  { key: 'waist',  label: 'Talia',  unit: 'cm' },
  { key: 'hips',   label: 'Biodra', unit: 'cm' },
  { key: 'bicep',  label: 'Biceps', unit: 'cm' },
  { key: 'thigh',  label: 'Udo',    unit: 'cm' },
];

export function useMeasurements() {
  const { user } = useAuth();
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!user) return;
    getMeasurements(user.uid).then(data => {
      setHistory(data);
      setLoading(false);
    });
  }, [user?.uid]);

  const save = useCallback(async (values) => {
    if (!user) return;
    const doc = await saveMeasurement(user.uid, values);
    const newEntry = { id: doc.id, ...values, date: { toDate: () => new Date() } };
    setHistory(prev => [newEntry, ...prev]);
  }, [user]);

  const remove = useCallback(async (id) => {
    if (!user) return;
    await deleteMeasurement(user.uid, id);
    setHistory(prev => prev.filter(m => m.id !== id));
  }, [user]);

  // Ostatni wpis — do podglądu na dashboardzie
  const latest = history[0] ?? null;

  return { history, loading, latest, save, remove };
}
