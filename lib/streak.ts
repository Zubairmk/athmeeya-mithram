export type DailyPeriod = "morning" | "evening";

export type CompletionLog = Record<string, { morning: boolean; evening: boolean }>;

export type StreakState = {
  streak: { current: number; longest: number; lastCompletedDate: string | null };
  completionLog: CompletionLog;
  settings: { playbackSpeed: number; notificationsEnabled: boolean };
};

const STORAGE_KEY = "athmeeya-mithram";

const DEFAULT_STATE: StreakState = {
  streak: { current: 0, longest: 0, lastCompletedDate: null },
  completionLog: {},
  settings: { playbackSpeed: 1, notificationsEnabled: false },
};

export function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isYesterday(dateStr: string | null, todayStr: string): boolean {
  if (!dateStr) return false;
  const diff =
    (new Date(todayStr).getTime() - new Date(dateStr).getTime()) / 86400000;
  return diff === 1;
}

function normalize(state: StreakState): StreakState {
  const { lastCompletedDate, current } = state.streak;
  const today = todayKey();
  if (
    lastCompletedDate &&
    lastCompletedDate !== today &&
    !isYesterday(lastCompletedDate, today) &&
    current !== 0
  ) {
    return { ...state, streak: { ...state.streak, current: 0 } };
  }
  return state;
}

export function loadState(): StreakState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const state: StreakState = raw
      ? { ...DEFAULT_STATE, ...JSON.parse(raw) }
      : DEFAULT_STATE;
    return normalize(state);
  } catch {
    return DEFAULT_STATE;
  }
}

function saveState(state: StreakState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getPlaybackSpeed(): number {
  return loadState().settings.playbackSpeed;
}

export function setPlaybackSpeed(speed: number) {
  if (typeof window === "undefined") return;
  const state = loadState();
  state.settings.playbackSpeed = speed;
  saveState(state);
}

export function getRecentDays(days: number) {
  const state = loadState();
  const result: { date: string; morning: boolean; evening: boolean }[] = [];
  const cursor = new Date();
  for (let i = 0; i < days; i++) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
    const day = state.completionLog[key] ?? { morning: false, evening: false };
    result.push({ date: key, ...day });
    cursor.setDate(cursor.getDate() - 1);
  }
  return result;
}

export function todayCompletion(state: StreakState) {
  return state.completionLog[todayKey()] ?? { morning: false, evening: false };
}

export function toggleCompletion(period: DailyPeriod): StreakState {
  const state = loadState();
  const key = todayKey();
  const day = state.completionLog[key] ?? { morning: false, evening: false };
  day[period] = !day[period];
  state.completionLog[key] = day;

  if (day.morning && day.evening) {
    if (state.streak.lastCompletedDate !== key) {
      const wasConsecutive =
        isYesterday(state.streak.lastCompletedDate, key) ||
        state.streak.lastCompletedDate === null;
      const current = wasConsecutive ? state.streak.current + 1 : 1;
      state.streak.current = current;
      state.streak.longest = Math.max(state.streak.longest, current);
      state.streak.lastCompletedDate = key;
    }
  } else if (state.streak.lastCompletedDate === key) {
    state.streak.current = Math.max(0, state.streak.current - 1);
    state.streak.lastCompletedDate = null;
  }

  saveState(state);
  return state;
}
