"use client";
import { useSyncExternalStore, type Dispatch, type SetStateAction } from "react";
import { loadData, saveData } from "@/lib/storage/storage";
import { STORAGE_KEY } from "@/lib/storage/storage-keys";
import type { AppData } from "@/types";

const listeners = new Set<() => void>();
let snapshot: AppData | null = null;
let initialized = false;

function getSnapshot(): AppData | null {
  if (!initialized) {
    snapshot = loadData();
    initialized = true;
  }
  return snapshot;
}

function getServerSnapshot(): AppData | null {
  return null;
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function handleStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY && event.key !== null) return;
  snapshot = loadData();
  initialized = true;
  notifyListeners();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorage);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorage);
    }
  };
}

const setData: Dispatch<SetStateAction<AppData | null>> = (nextData) => {
  const next = typeof nextData === "function" ? nextData(getSnapshot()) : nextData;
  snapshot = next;
  initialized = true;
  if (next) saveData(next);
  notifyListeners();
};

export function useAppData() {
  const data = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return { data, setData };
}
