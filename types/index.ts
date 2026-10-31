export type Priority = "P1" | "P2" | "P3" | "P4";
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type GoalStatus = "not_started" | "in_progress" | "completed" | "paused";
export type GoalCategory = "education" | "career" | "health" | "finance" | "personal" | "projects" | "other";
export type NoteCategory = "general" | "work" | "personal" | "ideas";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: TaskStatus;
  estimatedDuration: number; // minutes
  deadline: string | null;
  createdAt: string;
  updatedAt: string;
  scheduledStart: string | null;
  scheduledEnd: string | null;
  locked: boolean;
  notes: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: GoalCategory;
  startDate: string;
  targetDate: string;
  progress: number;
  status: GoalStatus;
  milestones: { id: string; title: string; done: boolean }[];
  type: "daily" | "weekly" | "monthly" | "yearly";
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  language: "en" | "so";
  workStart: string; // HH:mm
  workEnd: string;
  breakDuration: number; // minutes
  interval: number; // minutes
  theme: "light" | "dark";
}

export interface AppData {
  version: number;
  tasks: Task[];
  goals: Goal[];
  notes: Note[];
  settings: Settings;
}
