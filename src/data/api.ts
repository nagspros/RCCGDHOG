import { useEffect, useState } from 'react';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

export async function api<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method, signal, credentials: 'same-origin',
      headers: { 'X-DHOG-Request': '1', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError('The church server is unavailable. Please try again.', 0);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || data === null) {
    const message = typeof data?.detail === 'string'
      ? data.detail
      : response.status === 422 && Array.isArray(data?.detail)
        ? data.detail.map((item: { loc: string[]; msg: string }) => `${item.loc.at(-1)}: ${item.msg}`).join(' · ')
      : 'The church server could not complete this request. Please try again.';
    throw new ApiError(message, response.status);
  }
  return data as T;
}

export function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
}

export function usePublicData<T>(path: string, initial: T, interval = 5000) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    async function refresh() {
      try {
        if (document.visibilityState === 'visible') {
          setData(await api<T>(path, 'GET', undefined, controller.signal));
        }
      } catch {
        // Keep the most recent public information when the server is temporarily unavailable.
      } finally {
        if (!controller.signal.aborted) timer = setTimeout(refresh, interval);
      }
    }
    void refresh();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [path, interval]);
  return data;
}
