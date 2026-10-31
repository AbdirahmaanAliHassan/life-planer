import { STORAGE_KEY, STORAGE_VERSION, defaultSettings, safeParse } from "./storage-keys";
import type { AppData, Task, Goal, Note, Settings } from "@/types";

const emptyData: AppData = {
  version: STORAGE_VERSION,
  tasks: [],
  goals: [],
  notes: [],
  settings: { ...defaultSettings },
};

export function loadData(): AppData {
  if (typeof window === "undefined") return { ...emptyData };
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = safeParse<AppData | null>(raw, null);
  if (!parsed || parsed.version !== STORAGE_VERSION) {
    return { ...emptyData, ...(parsed || {}) };
  }
  return {
    version: STORAGE_VERSION,
    tasks: parsed.tasks || [],
    goals: parsed.goals || [],
    notes: parsed.notes || [],
    settings: { ...defaultSettings, ...(parsed.settings || {}) },
  };
}

export function saveData(data: AppData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function exportData(): string {
  return JSON.stringify(loadData(), null, 2);
}

export function importData(json: string): AppData {
  const parsed = JSON.parse(json) as AppData;
  if (!parsed || !Array.isArray(parsed.tasks)) throw new Error("Invalid data");
  const data: AppData = {
    version: STORAGE_VERSION,
    tasks: parsed.tasks || [],
    goals: parsed.goals || [],
    notes: parsed.notes || [],
    settings: { ...defaultSettings, ...(parsed.settings || {}) },
  };
  saveData(data);
  return data;
}

export function clearData() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export type { Task, Goal, Note, Settings };
