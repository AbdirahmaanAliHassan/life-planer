"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, Plus, Target } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { uid } from "@/lib/storage/storage-keys";
import { getLocale, t } from "@/lib/translations";
import type { Goal, GoalCategory } from "@/types";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";

const categories: GoalCategory[] = ["personal", "health", "career", "education", "finance", "projects", "other"];

export default function Goals() {
  const { data, setData } = useAppData();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<GoalCategory>("personal");
  const [targetDate, setTargetDate] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  if (!data) return null;

  const lang = data.settings.language;
  const activeGoals = data.goals.filter((goal) => goal.status === "not_started" || goal.status === "in_progress");
  const addGoal = () => {
    if (!title.trim()) return;
    const now = new Date().toISOString();
    const goal: Goal = {
      id: uid(), title: title.trim(), description: "", category,
      startDate: now.slice(0, 10), targetDate: targetDate || now.slice(0, 10),
      progress: 0, status: "not_started", milestones: [], type: "monthly", createdAt: now,
    };
    setData((current) => current ? { ...current, goals: [goal, ...current.goals] } : current);
    setTitle("");
    setTargetDate("");
    setCategory("personal");
    setIsAdding(false);
  };

  function updateProgress(id: string, value: number) {
    setData((current) => current ? {
      ...current,
      goals: current.goals.map((goal) => goal.id === id
        ? { ...goal, progress: value, status: value === 100 ? "completed" : value > 0 ? "in_progress" : "not_started" }
        : goal),
    } : current);
  }

  function toggleMilestone(goalId: string, milestoneId: string) {
    setData((current) => current ? {
      ...current,
      goals: current.goals.map((goal) => goal.id === goalId
        ? { ...goal, milestones: goal.milestones.map((milestone) => milestone.id === milestoneId ? { ...milestone, done: !milestone.done } : milestone) }
        : goal),
    } : current);
  }

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title={t(lang, "goals.title")}
        subtitle={t(lang, "goals.subtitle")}
        action={<button type="button" className="button-primary" onClick={() => setIsAdding((open) => !open)}><Plus size={16} />{t(lang, "goals.addGoal")}</button>}
      />
      {isAdding && (
        <form
          onSubmit={(event) => { event.preventDefault(); addGoal(); }}
          className="surface-card mb-5 grid grid-cols-1 items-end gap-3 p-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <label className="form-field sm:col-span-2 lg:col-span-1">{t(lang, "common.title")}
            <input autoFocus required maxLength={100} className="form-control" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t(lang, "goals.newGoal")} />
          </label>
          <label className="form-field">{t(lang, "common.category")}
            <select className="form-control" value={category} onChange={(event) => setCategory(event.target.value as GoalCategory)}>
              {categories.map((item) => <option key={item} value={item}>{t(lang, `categories.${item}`)}</option>)}
            </select>
          </label>
          <label className="form-field">{t(lang, "common.targetDate")}
            <input type="date" className="form-control" value={targetDate} onChange={(event) => setTargetDate(event.target.value)} />
          </label>
          <button type="submit" className="button-primary">{t(lang, "common.add")}</button>
        </form>
      )}

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink"><Target size={17} className="text-accent" />{t(lang, "goals.activeGoals")}</div>
        <span className="text-xs text-muted">{activeGoals.length} {t(lang, "goals.goalsOnTrack")}</span>
      </div>
      {data.goals.length ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          {data.goals.map((goal) => {
            const label = t(lang, `categories.${goal.category}`);
            const categoryLabel = label.startsWith("categories.") ? goal.category : label;
            const target = new Intl.DateTimeFormat(getLocale(lang), { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${goal.targetDate.slice(0, 10)}T12:00:00`));
            const milestonesDone = goal.milestones.filter((milestone) => milestone.done).length;
            return (
              <article key={goal.id} className="surface-card flex min-w-0 flex-col p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf2ff] text-accent"><Target size={18} /></span>
                  {goal.status === "completed" && <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-success">{t(lang, "tasks.statusCompleted")}</span>}
                </div>
                <h2 className="mt-4 break-words text-base font-semibold leading-6 text-ink">{goal.title}</h2>
                {goal.description && <p className="mt-1 text-xs leading-5 text-muted">{goal.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-secondary">{categoryLabel}</span>
                  {goal.targetDate && <span className="inline-flex items-center gap-1.5 text-[11px] text-muted"><CalendarDays size={13} />{target}</span>}
                </div>
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-xs">
                    <span className="font-medium text-secondary">{t(lang, "goals.progress")}</span>
                    <span className="font-semibold text-ink">{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} tone={goal.progress === 100 ? "green" : "blue"} />
                  <input
                    type="range"
                    min={0}
                    max={100}
                    aria-label={`${t(lang, "goals.progress")} ${goal.title}`}
                    value={goal.progress}
                    onChange={(event) => updateProgress(goal.id, Number(event.target.value))}
                    className="mt-3 h-1 w-full cursor-pointer accent-[#4f7df3]"
                  />
                </div>
                {goal.milestones.length > 0 && (
                  <div className="mt-3 border-t border-line pt-3">
                    <p className="mb-2 text-[11px] font-medium text-secondary">{milestonesDone}/{goal.milestones.length}</p>
                    <div className="space-y-2">
                      {goal.milestones.map((milestone) => (
                        <label key={milestone.id} className="flex cursor-pointer items-start gap-2 text-xs text-secondary">
                          <input type="checkbox" checked={milestone.done} onChange={() => toggleMilestone(goal.id, milestone.id)} className="mt-0.5 accent-[#4f7df3]" />
                          <span className={milestone.done ? "text-muted line-through" : ""}>{milestone.title}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-auto flex items-center justify-end pt-4 text-[11px] text-muted"><ArrowUpRight size={13} className="mr-1" />{goal.type}</div>
              </article>
            );
          })}
        </div>
      ) : <EmptyState title={t(lang, "goals.noGoals")} description={t(lang, "goals.subtitle")} icon={Target} />}
    </div>
  );
}
