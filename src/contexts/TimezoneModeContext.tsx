'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

export type TimezoneMode = 'utc' | 'local';

interface TimezoneModeContextValue {
  mode: TimezoneMode;
  setMode: (mode: TimezoneMode) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'theconn:timezone-mode';
const DEFAULT_MODE: TimezoneMode = 'utc';

function isTimezoneMode(value: unknown): value is TimezoneMode {
  return value === 'utc' || value === 'local';
}

const listeners = new Set<() => void>();
let cachedMode: TimezoneMode = DEFAULT_MODE;
let initialized = false;

function readFromStorage(): TimezoneMode {
  if (typeof window === 'undefined') return DEFAULT_MODE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isTimezoneMode(raw) ? raw : DEFAULT_MODE;
  } catch {
    return DEFAULT_MODE;
  }
}

function ensureInitialized(): void {
  if (initialized || typeof window === 'undefined') return;
  cachedMode = readFromStorage();
  initialized = true;
}

function emit(): void {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  ensureInitialized();
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    const next = isTimezoneMode(event.newValue) ? event.newValue : DEFAULT_MODE;
    if (next !== cachedMode) {
      cachedMode = next;
      emit();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot(): TimezoneMode {
  ensureInitialized();
  return cachedMode;
}

function getServerSnapshot(): TimezoneMode {
  return DEFAULT_MODE;
}

function writeMode(mode: TimezoneMode): void {
  if (mode === cachedMode) return;
  cachedMode = mode;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* empty */
    }
  }
  emit();
}

const TimezoneModeContext = createContext<TimezoneModeContextValue | null>(null);

interface TimezoneModeProviderProps {
  children: ReactNode;
}

export function TimezoneModeProvider({ children }: TimezoneModeProviderProps) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setMode = useCallback((next: TimezoneMode) => writeMode(next), []);
  const toggle = useCallback(() => writeMode(cachedMode === 'utc' ? 'local' : 'utc'), []);
  const value = useMemo<TimezoneModeContextValue>(
    () => ({ mode, setMode, toggle }),
    [mode, setMode, toggle],
  );
  return <TimezoneModeContext.Provider value={value}>{children}</TimezoneModeContext.Provider>;
}

export function useTimezoneMode(): TimezoneModeContextValue {
  const ctx = useContext(TimezoneModeContext);
  if (!ctx) {
    throw new Error('useTimezoneMode must be used within a TimezoneModeProvider');
  }
  return ctx;
}
