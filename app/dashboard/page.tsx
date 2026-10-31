"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { uid } from "@/lib/storage/storage-keys";
import { getLocale, t } from "@/lib/translations";
import type { Task } from "@/types";
import {
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  Clock3,
  ListTodo,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { EmptyState, PageHeader, Panel, ProgressBar, StatCard, TaskRow } from "@/components/ui";

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Dashboard() {
  return <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}><DashboardContent /></Suspense>;
}

function DashboardContent() {
  const { data, setData } = useAppData();
  const [title, setTitle] = useState("");
  if (!data) return <p className="text-sm text-muted">{t("en", "common.loading")}</p>;

  const lang = data.settings.language;
  const now = new Date();
  const today = dateKey(now);
  const locale = getLocale(lang);
  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric" }).format(now);
  const hour = now.getHours();
  const greeting = hour < 12 ? t(lang, "dashboard.greetingMorning") : hour < 18 ? t(lang, "dashboard.greetingAfternoon") : t(lang, "dashboard.greetingEvening");
  const activeTasks = data.tasks.filter((task) => task.status !== "completed" && task.status !== "cancelled");
  const completed = data.tasks.filter((task) => task.status === "completed").length;
  const pending = activeTasks.length;
  const productivity = data.tasks.length ? Math.round((completed / data.tasks.length) * 100) : 0;
  const todayTasks = data.tasks
    .filter((task) => task.deadline?.slice(0, 10) === today || (task.scheduledStart !== null && dateKey(new Date(task.scheduledStart)) === today))
    .sort((a, b) => a.priority.localeCompare(b.priority));
  const upcoming = [...activeTasks].sort((a, b) => a.priority.localeCompare(b.priority)).slice(0, 4);
  const doneToday = data.tasks.filter((task) => task.status === "completed" && dateKey(new Date(task.updatedAt)) === today).length;
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 6);
  const completedThisWeek = data.tasks.filter((task) => task.status === "completed" && dateKey(new Date(task.updatedAt)) >= dateKey(weekStart)).length;

  function quickAdd() {
    if (!title.trim()) return;
    const timestamp = new Date().toISOString();
    const task: Task = {
      id: uid(), title: title.trim(), description: "", category: "general", priority: "P3",
      status: "pending", estimatedDuration: 30, deadline: null, createdAt: timestamp,
      updatedAt: timestamp, scheduledStart: null, scheduledEnd: null, locked: false, notes: "",
    };
    setData((current) => current ? { ...current, tasks: [task, ...current.tasks] } : current);
    setTitle("");
  }

  function toggleTask(id: string) {
    setData((current) => current ? {
      ...current,
      tasks: current.tasks.map((task) => task.id === id
        ? { ...task, status: task.status === "completed" ? "pending" : "completed", updatedAt: new Date().toISOString() }
        : task),
    } : current);
  }

  return (
    <div className="mx-auto max-w-[1320px]">
      <PageHeader
        title={greeting}
        subtitle={t(lang, "dashboard.subtitle")}
        eyebrow={dateLabel}
        action={
          <Link href="/tasks" className="button-primary"><Plus size={16} />{t(lang, "common.addTask")}</Link>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t(lang, "dashboard.totalTasks")} value={data.tasks.length} icon={ListTodo} tone="slate" detail={t(lang, "tasks.allTasks")} />
        <StatCard label={t(lang, "dashboard.completed")} value={completed} icon={CheckCircle2} tone="green" detail={`${productivity}% ${t(lang, "analytics.completionRate").toLowerCase()}`} />
        <StatCard label={t(lang, "dashboard.pending")} value={pending} icon={Clock3} tone="amber" detail={t(lang, "tasks.active")} />
        <StatCard label={t(lang, "dashboard.productivity")} value={`${productivity}%`} icon={TrendingUp} tone="blue" detail={t(lang, "dashboard.completed")} />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,0.85fr)]">
        <div className="min-w-0 space-y-4">
          <Panel
            title={t(lang, "dashboard.todaySchedule")}
            description={dateLabel}
            action={<Link className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-[#315fd4]" href="/calendar">{t(lang, "dashboard.viewAll")}<ArrowRight size={13} /></Link>}
          >
            {todayTasks.length ? (
              <div className="divide-y divide-line">
                {todayTasks.slice(0, 6).map((task) => <TaskRow key={task.id} task={task} lang={lang} onToggle={() => toggleTask(task.id)} compact />)}
              </div>
            ) : (
              <EmptyState title={t(lang, "dashboard.noTasks")} icon={CheckCircle2} />
            )}
          </Panel>

          <Panel
            title={t(lang, "dashboard.upcoming")}
            action={<Link className="inline-flex items-center gap-1 text-xs font-semibold text-accent hover:text-[#315fd4]" href="/tasks">{t(lang, "dashboard.viewAll")}<ArrowRight size={13} /></Link>}
          >
            {upcoming.length ? <div className="space-y-2">{upcoming.map((task) => <TaskRow key={task.id} task={task} lang={lang} onToggle={() => toggleTask(task.id)} />)}</div> : <EmptyState title={t(lang, "dashboard.noTasks")} icon={CheckCircle2} />}
          </Panel>

          <div className="flex flex-col gap-2 rounded-2xl border border-[#dce6fb] bg-[#f0f4ff] p-4 sm:flex-row sm:items-center">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-accent"><Sparkles size={17} /></span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#243b64]">{t(lang, "dashboard.focusTip")}</p>
              <p className="mt-1 text-xs leading-5 text-[#657695]">{t(lang, "dashboard.focusCopy")}</p>
            </div>
            <Link href="/planner" className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#315fd4]">{t(lang, "nav.planner")}<ArrowRight size={13} /></Link>
          </div>
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel title={t(lang, "dashboard.progress")} description={t(lang, "analytics.completionRate")}>
            <div className="flex items-end justify-between gap-3">
              <span className="text-[32px] font-semibold leading-none tracking-[-0.04em] text-ink">{productivity}%</span>
              <span className="text-xs text-muted">{completed} / {data.tasks.length}</span>
            </div>
            <div className="mt-4"><ProgressBar value={productivity} /></div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
              <div><p className="text-[11px] text-muted">{t(lang, "dashboard.completedToday")}</p><p className="mt-1 text-lg font-semibold text-ink">{doneToday}</p></div>
              <div><p className="text-[11px] text-muted">{t(lang, "analytics.weeklyActivity")}</p><p className="mt-1 text-lg font-semibold text-ink">{completedThisWeek}</p></div>
            </div>
          </Panel>

          <Panel title={t(lang, "dashboard.quickNotes")} action={<Link className="text-xs font-semibold text-accent" href="/notes">{t(lang, "dashboard.viewAll")}</Link>}>
            {data.notes.length ? (
              <div className="space-y-1">
                {data.notes.slice(0, 3).map((note) => (
                  <Link key={note.id} href="/notes" className="block rounded-lg px-2.5 py-2 transition-colors hover:bg-slate-50">
                    <p className="truncate text-[13px] font-medium text-ink">{note.title || t(lang, "notes.untitled")}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{note.content}</p>
                  </Link>
                ))}
              </div>
            ) : <EmptyState title={t(lang, "dashboard.noNotes")} icon={CircleHelp} />}
          </Panel>

          <Panel title={t(lang, "dashboard.quickAddPlaceholder")}>
            <form onSubmit={(event) => { event.preventDefault(); quickAdd(); }} className="flex gap-2">
              <input className="form-control" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t(lang, "tasks.taskTitle")} aria-label={t(lang, "tasks.taskTitle")} />
              <button type="submit" className="button-primary shrink-0 px-3" aria-label={t(lang, "common.addTask")}><Plus size={16} /></button>
            </form>
          </Panel>
          <p className="px-1 text-[11px] leading-5 text-muted">{new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(now)}</p>
        </aside>
      </div>
    </div>
  );
}
