export const STORAGE_KEY = "dlm_data";
export const STORAGE_VERSION = 1;

export const defaultSettings = {
  language: "en" as const,
  workStart: "09:00",
  workEnd: "17:00",
  breakDuration: 15,
  interval: 30,
  theme: "light" as const,
};

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
