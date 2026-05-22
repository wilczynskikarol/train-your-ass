import { useCallback, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/config';

const generateReportFn = httpsCallable(functions, 'generateReport');

export function useReport() {
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const generate = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const result = await generateReportFn(params);
      setReport(result.data.report);
    } catch (e) {
      setError(e.message ?? 'Nie udało się wygenerować raportu.');
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setReport(null);
    setError(null);
  }, []);

  return { report, loading, error, generate, clear };
}
