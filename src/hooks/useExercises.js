import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCustomExercises, addCustomExercise, updateCustomExercise, deleteCustomExercise } from '../firebase/helpers';
import localDB from '../data/exerciseDB.json';

export const CATEGORIES = [
  'Wszystkie', 'Klatka', 'Plecy', 'Barki', 'Biceps', 'Triceps',
  'Nogi', 'Core', 'Pełne ciało', 'Kardio',
];

export function useExercises() {
  const { user } = useAuth();
  const [custom, setCustom]       = useState([]);
  const [customLoading, setCustomLoading] = useState(true);
  const [query, setQuery]         = useState('');
  const [category, setCategory]   = useState('Wszystkie');

  useEffect(() => {
    if (!user) return;
    getCustomExercises(user.uid).then(data => {
      setCustom(data);
      setCustomLoading(false);
    });
  }, [user?.uid]);

  const allExercises = useMemo(() => [
    ...localDB,
    ...custom,
  ], [custom]);

  const filtered = useMemo(() => {
    let list = allExercises;
    if (category !== 'Wszystkie') {
      list = list.filter(e => e.category === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.muscles?.some(m => m.toLowerCase().includes(q))
      );
    }
    return list;
  }, [allExercises, category, query]);

  const getById = useCallback((id) => {
    return allExercises.find(e => String(e.id) === String(id)) ?? null;
  }, [allExercises]);

  const addCustom = useCallback(async (data) => {
    if (!user) return;
    const ref = await addCustomExercise(user.uid, data);
    const newEx = { id: ref.id, ...data, custom: true };
    setCustom(prev => [...prev, newEx]);
    return newEx;
  }, [user]);

  const updateCustom = useCallback(async (id, data) => {
    if (!user) return;
    await updateCustomExercise(user.uid, id, data);
    setCustom(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
  }, [user]);

  const removeCustom = useCallback(async (id) => {
    if (!user) return;
    await deleteCustomExercise(user.uid, id);
    setCustom(prev => prev.filter(e => e.id !== id));
  }, [user]);

  return {
    allExercises, filtered, customLoading,
    query, setQuery,
    category, setCategory,
    getById, addCustom, updateCustom, removeCustom,
  };
}
