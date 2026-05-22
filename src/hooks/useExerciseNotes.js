import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getExerciseNotes, saveExerciseNote } from '../firebase/helpers';

export function useExerciseNotes() {
  const { user } = useAuth();
  const [notes, setNotes] = useState({});
  const saveTimer = useRef(null);

  useEffect(() => {
    if (!user) return;
    getExerciseNotes(user.uid).then(setNotes);
  }, [user?.uid]);

  const getNote = useCallback((exerciseId) => {
    return notes[String(exerciseId)] ?? '';
  }, [notes]);

  const saveNote = useCallback((exerciseId, text) => {
    const id = String(exerciseId);
    setNotes(prev => ({ ...prev, [id]: text }));
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (user) saveExerciseNote(user.uid, id, text);
    }, 800);
  }, [user]);

  return { getNote, saveNote };
}
