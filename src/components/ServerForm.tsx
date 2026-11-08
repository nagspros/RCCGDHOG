import { useRef, useState } from 'react';
import { api, errorMessage } from '../data/api';

export function useServerForm() {
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit<T>(path: string, data: unknown, onError?: (cause: unknown) => void): Promise<T | undefined> {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setError('');
    try {
      return await api<T>(path, 'POST', data);
    } catch (cause) {
      setError(errorMessage(cause));
      onError?.(cause);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return { submit, busy, error };
}

export function FormError({ error }: { error: string }) {
  return error ? <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-900">{error}</p> : null;
}
