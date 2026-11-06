import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { Reading } from '../types/tarot';
import { load, removeAll, save, todayKey } from './storage';

export type ThemeId = 'midnight' | 'abyss' | 'crimson';
export type MotionLevel = 'full' | 'reduced';

export interface Settings {
  theme: ThemeId;
  allowReversed: boolean;
  /** 星空粒子特效 */
  particles: boolean;
  motion: MotionLevel;
  /** 抽牌后是否自动依次翻牌（否则手动点击翻牌） */
  autoReveal: boolean;
  ai: {
    enabled: boolean;
    apiKey: string;
    model: string;
  };
}

export interface DailyRecord {
  date: string;
  readingId: string;
}

export interface AppState {
  settings: Settings;
  history: Reading[];
  favorites: string[];
  daily: DailyRecord[];
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'midnight',
  allowReversed: true,
  particles: true,
  motion: 'full',
  autoReveal: false,
  ai: { enabled: false, apiKey: '', model: 'claude-opus-5-5' },
};

const MAX_HISTORY = 200;

type Action =
  | { type: 'settings'; patch: Partial<Settings> }
  | { type: 'addReading'; reading: Reading; daily?: boolean }
  | { type: 'updateReading'; id: string; patch: Partial<Reading> }
  | { type: 'deleteReading'; id: string }
  | { type: 'clearHistory' }
  | { type: 'toggleFavorite'; cardId: string }
  | { type: 'reset' }
  | { type: 'import'; state: AppState };

function reducer(state: AppState, a: Action): AppState {
  switch (a.type) {
    case 'settings':
      return { ...state, settings: { ...state.settings, ...a.patch, ai: { ...state.settings.ai, ...(a.patch.ai ?? {}) } } };
    case 'addReading': {
      const history = [a.reading, ...state.history.filter((r) => r.id !== a.reading.id)].slice(0, MAX_HISTORY);
      const daily = a.daily
        ? [{ date: todayKey(new Date(a.reading.createdAt)), readingId: a.reading.id }, ...state.daily.filter((d) => d.date !== todayKey(new Date(a.reading.createdAt)))].slice(0, 400)
        : state.daily;
      return { ...state, history, daily };
    }
    case 'updateReading':
      return { ...state, history: state.history.map((r) => (r.id === a.id ? { ...r, ...a.patch } : r)) };
    case 'deleteReading':
      return { ...state, history: state.history.filter((r) => r.id !== a.id), daily: state.daily.filter((d) => d.readingId !== a.id) };
    case 'clearHistory':
      return { ...state, history: [], daily: [] };
    case 'toggleFavorite':
      return {
        ...state,
        favorites: state.favorites.includes(a.cardId) ? state.favorites.filter((f) => f !== a.cardId) : [a.cardId, ...state.favorites],
      };
    case 'reset':
      return { settings: DEFAULT_SETTINGS, history: [], favorites: [], daily: [] };
    case 'import':
      return a.state;
  }
}

function init(): AppState {
  const stored = load<Partial<Settings>>('settings', {});
  return {
    settings: { ...DEFAULT_SETTINGS, ...stored, ai: { ...DEFAULT_SETTINGS.ai, ...(stored.ai ?? {}) } },
    history: load<Reading[]>('history', []),
    favorites: load<string[]>('favorites', []),
    daily: load<DailyRecord[]>('daily', []),
  };
}

interface Ctx {
  state: AppState;
  updateSettings: (patch: Partial<Settings>) => void;
  addReading: (r: Reading, opts?: { daily?: boolean }) => void;
  updateReading: (id: string, patch: Partial<Reading>) => void;
  deleteReading: (id: string) => void;
  clearHistory: () => void;
  toggleFavorite: (cardId: string) => void;
  isFavorite: (cardId: string) => boolean;
  getReading: (id: string) => Reading | undefined;
  todayDaily: () => Reading | undefined;
  resetAll: () => void;
  importState: (s: AppState) => void;
}

const AppContext = createContext<Ctx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);

  // 持久化
  useEffect(() => { save('settings', state.settings); }, [state.settings]);
  useEffect(() => { save('history', state.history); }, [state.history]);
  useEffect(() => { save('favorites', state.favorites); }, [state.favorites]);
  useEffect(() => { save('daily', state.daily); }, [state.daily]);

  // 主题与动效应用到根元素
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = state.settings.theme;
    root.dataset.motion = state.settings.motion;
  }, [state.settings.theme, state.settings.motion]);

  // 多标签页同步
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith('arcana:v1:')) dispatch({ type: 'import', state: init() });
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const getReading = useCallback((id: string) => state.history.find((r) => r.id === id), [state.history]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      updateSettings: (patch) => dispatch({ type: 'settings', patch }),
      addReading: (reading, opts) => dispatch({ type: 'addReading', reading, daily: opts?.daily }),
      updateReading: (id, patch) => dispatch({ type: 'updateReading', id, patch }),
      deleteReading: (id) => dispatch({ type: 'deleteReading', id }),
      clearHistory: () => dispatch({ type: 'clearHistory' }),
      toggleFavorite: (cardId) => dispatch({ type: 'toggleFavorite', cardId }),
      isFavorite: (cardId) => state.favorites.includes(cardId),
      getReading,
      todayDaily: () => {
        const rec = state.daily.find((d) => d.date === todayKey());
        return rec ? state.history.find((r) => r.id === rec.readingId) : undefined;
      },
      resetAll: () => {
        removeAll();
        dispatch({ type: 'reset' });
      },
      importState: (s) => dispatch({ type: 'import', state: s }),
    }),
    [state, getReading],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): Ctx {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

/** 动效是否开启（用户设置 + 系统偏好） */
export function useMotionEnabled(): boolean {
  const { state } = useApp();
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return state.settings.motion === 'full' && !prefersReduced;
}
