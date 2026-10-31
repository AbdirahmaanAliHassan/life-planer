"use client";

import { useState } from "react";
import { ArrowUpRight, CalendarDays, Pencil, Plus, Target, Trash2, X } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { uid } from "@/lib/storage/storage-keys";
import { getLocale, t } from "@/lib/translations";
import type { Goal, GoalCategory, GoalStatus } from "@/types";
import { EmptyState, PageHeader, ProgressBar } from "@/components/ui";

const categories: GoalCategory[] = ["personal", "health", "career", "education", "finance", "projects", "other"];
const goalTypes: Goal["type"][] = ["daily", "weekly", "monthly", "yearly"];
const goalStatuses: GoalStatus[] = ["not_started", "in_progress", "completed", "paused"];

type GoalForm = Pick<Goal, "title" | "description" | "category" | "targetDate" | "progress" | "status" | "type">;

const emptyForm: GoalForm = {
  title: "",
  description: "",
  category: "personal",
  targetDate: "",
  progress: 0,
  status: "not_started",
  type: "monthly",
};

export default function Goals() {
  const { data, setData } = useAppData();
  const [form, setForm] = useState<GoalForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  if (!data) return null;

  const lang = data.settings.language;
  const activeGoals = data.goals.filter((goal) => goal.status === "not_started" || goal.status === "in_progress");

  function openNewGoal() {
    setForm(emptyForm);
    setEditingId(null);
    setFormOpen(true);
  }

  function openEditGoal(goal: Goal) {
    setForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetDate: goal.targetDate,
      progress: goal.progress,
      status: goal.status,
      type: goal.type,
    });
    setEditingId(goal.id);
    setFormOpen(true);
  }

  function saveGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;
    const now = new Date().toISOString();
    if (editingId) {
      setData((current) => current ? {
        ...current,
        goals: current.goals.map((goal) => goal.id === editingId
          ? { ...goal, ...form, title, description: form.description.trim() }
          : goal),
      } : current);
    } else {
      const goal: Goal = {
        id: uid(),
        ...form,
        title,
        description: form.description.trim(),
        startDate: now.slice(0, 10),
        targetDate: form.targetDate,
        milestones: [],
        createdAt: now,
      };
      setData((current) => current ? { ...current, goals: [goal, ...current.goals] } : current);
    }
    setFormOpen(false);
  }

  function deleteGoal(goal: Goal) {
    if (!window.confirm(t(lang, "goals.deleteConfirm"))) return;
    setData((current) => current ? { ...current, goals: current.goals.filter((item) => item.id !== goal.id) } : current);
  }

  function updateProgress(id: string, value: number) {
    setData((current) => current ? {
      ...current,
      goals: current.goals.map((goal) => goal.id === id
        ? { ...goal, progress: value, status: value === 100 ? "completed" : goal.status === "paused" ? "paused" : value > 0 ? "in_progress" : "not_started" }
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
        action={<button type="button" className="button-primary" onClick={openNewGoal}><Plus size={16} />{t(lang, "goals.addGoal")}</button>}
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink"><Target size={17} className="text-accent" />{t(lang, "goals.activeGoals")}</div>
        <span className="text-xs text-muted">{activeGoals.length} {t(lang, "goals.goalsOnTrack")}</span>
      </div>
      {data.goals.length ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
          {data.goals.map((goal) => {
            const label = t(lang, `categories.${goal.category}`);
            const categoryLabel = label.startsWith("categories.") ? goal.category : label;
            const targetDate = goal.targetDate ? new Date(`${goal.targetDate.slice(0, 10)}T12:00:00`) : null;
            const target = targetDate && !Number.isNaN(targetDate.getTime())
              ? new Intl.DateTimeFormat(getLocale(lang), { month: "short", day: "numeric", year: "numeric" }).format(targetDate)
              : null;
            const milestonesDone = goal.milestones.filter((milestone) => milestone.done).length;
            return (
              <article key={goal.id} className="surface-card flex min-w-0 flex-col p-5 transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#edf2ff] text-accent"><Target size={18} /></span>
                  <div className="flex items-center gap-1">
                    {goal.status === "completed" && <span className="mr-1 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-success">{t(lang, "goals.statusCompleted")}</span>}
                    <button type="button" className="icon-button" onClick={() => openEditGoal(goal)} aria-label={t(lang, "common.edit")} title={t(lang, "common.edit")}><Pencil size={15} /></button>
                    <button type="button" className="icon-button icon-button-danger" onClick={() => deleteGoal(goal)} aria-label={t(lang, "goals.deleteGoal")} title={t(lang, "goals.deleteGoal")}><Trash2 size={15} /></button>
                  </div>
                </div>
                <h2 className="mt-4 break-words text-base font-semibold leading-6 text-ink">{goal.title}</h2>
                {goal.description && <p className="mt-1 text-xs leading-5 text-muted">{goal.description}</p>}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-secondary">{categoryLabel}</span>
                  {target && <span className="inline-flex items-center gap-1.5 text-[11px] text-muted"><CalendarDays size={13} />{target}</span>}
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
                <div className="mt-auto flex items-center justify-between pt-4 text-[11px] text-muted">
                  <span className={`rounded-md px-2 py-1 ${goal.status === "completed" ? "bg-green-50 text-success" : goal.status === "paused" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-secondary"}`}>{t(lang, `goals.status${goal.status === "not_started" ? "NotStarted" : goal.status === "in_progress" ? "InProgress" : goal.status === "completed" ? "Completed" : "Paused"}`)}</span>
                  <span className="inline-flex items-center"><ArrowUpRight size={13} className="mr-1" />{t(lang, `goals.${goal.type}`)}</span>
                </div>
              </article>
            );
          })}
        </div>
      ) : <EmptyState title={t(lang, "goals.noGoals")} description={t(lang, "goals.subtitle")} icon={Target} />}

      {formOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="goal-form-title">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="goal-form-title" className="text-lg font-semibold text-ink">{t(lang, editingId ? "goals.editGoal" : "goals.addGoal")}</h2>
                <p className="mt-1 text-xs text-muted">{t(lang, "goals.subtitle")}</p>
              </div>
              <button type="button" className="icon-button" onClick={() => setFormOpen(false)} aria-label={t(lang, "common.close")}><X size={18} /></button>
            </div>
            <form onSubmit={saveGoal} className="space-y-4">
              <label className="form-field">{t(lang, "common.title")}
                <input autoFocus required maxLength={100} className="form-control" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={t(lang, "goals.newGoal")} />
              </label>
              <label className="form-field">{t(lang, "common.description")}
                <textarea rows={3} className="form-control resize-y" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder={t(lang, "goals.goalDescription")} />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="form-field">{t(lang, "common.category")}
                  <select className="form-control" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as GoalCategory })}>
                    {categories.map((item) => <option key={item} value={item}>{t(lang, `categories.${item}`)}</option>)}
                  </select>
                </label>
                <label className="form-field">{t(lang, "goals.goalType")}
                  <select className="form-control" value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as Goal["type"] })}>
                    {goalTypes.map((type) => <option key={type} value={type}>{t(lang, `goals.${type}`)}</option>)}
                  </select>
                </label>
                <label className="form-field">{t(lang, "common.targetDate")}
                  <input type="date" className="form-control" value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} />
                </label>
                <label className="form-field">{t(lang, "common.status")}
                  <select className="form-control" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as GoalStatus })}>
                    {goalStatuses.map((status) => {
                      const key = status === "not_started" ? "NotStarted" : status === "in_progress" ? "InProgress" : status === "completed" ? "Completed" : "Paused";
                      return <option key={status} value={status}>{t(lang, `goals.status${key}`)}</option>;
                    })}
                  </select>
                </label>
              </div>
              <label className="form-field">{t(lang, "goals.progress")} · {form.progress}%
                <input type="range" min={0} max={100} value={form.progress} onChange={(event) => {
                  const progress = Number(event.target.value);
                  setForm({ ...form, progress, status: progress === 100 ? "completed" : progress > 0 ? "in_progress" : form.status === "completed" ? "not_started" : form.status });
                }} className="h-1 w-full cursor-pointer accent-[#4f7df3]" />
              </label>
              <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
                <button type="button" className="button-secondary" onClick={() => setFormOpen(false)}>{t(lang, "common.cancel")}</button>
                <button type="submit" className="button-primary">{t(lang, "common.save")}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
