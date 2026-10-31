"use client";

import { Suspense } from "react";
import { Activity, CheckCircle2, CircleDashed, ListTodo, Target, TrendingUp } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { getLocale, t } from "@/lib/translations";
import { EmptyState, PageHeader, Panel, ProgressBar, StatCard } from "@/components/ui";

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Analytics() {
  return <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}><AnalyticsContent /></Suspense>;
}

function AnalyticsContent() {
  const { data } = useAppData();
  if (!data) return null;

  const lang = data.settings.language;
  const now = new Date();
  const todayKey = dateKey(now);
  const completed = data.tasks.filter((task) => task.status === "completed");
  const active = data.tasks.filter((task) => task.status === "pending" || task.status === "in_progress");
  const cancelled = data.tasks.filter((task) => task.status === "cancelled");
  const completionRate = data.tasks.length ? Math.round((completed.length / data.tasks.length) * 100) : 0;
  const dailyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (6 - index));
    const key = dateKey(date);
    const count = completed.filter((task) => dateKey(new Date(task.updatedAt)) === key).length;
    return { date, key, count };
  });
  const maxActivity = Math.max(1, ...dailyActivity.map((day) => day.count));
  const monthStart = dateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29));
  const completedThisMonth = completed.filter((task) => dateKey(new Date(task.updatedAt)) >= monthStart && dateKey(new Date(task.updatedAt)) <= todayKey).length;
  const categories = data.tasks.reduce<Record<string, number>>((counts, task) => {
    counts[task.category] = (counts[task.category] ?? 0) + 1;
    return counts;
  }, {});
  const categoryRows = Object.entries(categories).sort((a, b) => b[1] - a[1]);
  const activeGoals = data.goals.filter((goal) => goal.status === "not_started" || goal.status === "in_progress");
  const avgGoalProgress = data.goals.length ? Math.round(data.goals.reduce((sum, goal) => sum + goal.progress, 0) / data.goals.length) : 0;
  const statusRows = [
    { key: "tasks.statusPending", count: data.tasks.filter((task) => task.status === "pending").length, color: "bg-slate-400" },
    { key: "tasks.statusInProgress", count: data.tasks.filter((task) => task.status === "in_progress").length, color: "bg-accent" },
    { key: "tasks.statusCompleted", count: completed.length, color: "bg-success" },
    { key: "tasks.statusCancelled", count: cancelled.length, color: "bg-red-400" },
  ];

  return (
    <div className="mx-auto max-w-[1240px]">
      <PageHeader title={t(lang, "analytics.title")} subtitle={t(lang, "analytics.subtitle")} />
      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label={t(lang, "dashboard.totalTasks")} value={data.tasks.length} icon={ListTodo} tone="slate" />
        <StatCard label={t(lang, "dashboard.completed")} value={completed.length} icon={CheckCircle2} tone="green" />
        <StatCard label={t(lang, "tasks.active")} value={active.length} icon={CircleDashed} tone="blue" />
        <StatCard label={t(lang, "analytics.completionRate")} value={`${completionRate}%`} icon={TrendingUp} tone="amber" />
      </div>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div className="min-w-0 space-y-4">
          <Panel title={t(lang, "analytics.weeklyActivity")} description={t(lang, "analytics.weeklyCopy")}>
            <div className="flex h-[200px] items-end justify-between gap-2 border-b border-line px-1 pb-2">
              {dailyActivity.map(({ date, key, count }) => {
                const label = new Intl.DateTimeFormat(getLocale(lang), { weekday: "short" }).format(date);
                return (
                  <div key={key} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                    <span className="text-[10px] font-medium text-secondary">{count || ""}</span>
                    <div className="flex h-[140px] w-full items-end justify-center">
                      <div
                        className={`w-full max-w-9 rounded-t-md ${count ? "bg-accent" : "bg-slate-100"}`}
                        style={{ height: `${count ? Math.max(10, (count / maxActivity) * 100) : 5}%` }}
                        role="img"
                        aria-label={`${label}: ${count}`}
                      />
                    </div>
                    <span className={`text-[10px] ${key === todayKey ? "font-semibold text-accent" : "text-muted"}`}>{label}</span>
                  </div>
                );
              })}
            </div>
            {!completed.length && <p className="mt-4 text-center text-xs text-muted">{t(lang, "analytics.noActivity")}</p>}
          </Panel>

          <Panel title={t(lang, "analytics.categoryBreakdown")}>
            {categoryRows.length ? (
              <div className="space-y-4">
                {categoryRows.map(([category, count]) => {
                  const rawLabel = t(lang, `categories.${category}`);
                  const label = rawLabel.startsWith("categories.") ? category : rawLabel;
                  return (
                    <div key={category}>
                      <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate font-medium text-secondary">{label}</span>
                        <span className="shrink-0 text-muted">{count}</span>
                      </div>
                      <ProgressBar value={data.tasks.length ? (count / data.tasks.length) * 100 : 0} />
                    </div>
                  );
                })}
              </div>
            ) : <EmptyState title={t(lang, "common.empty")} icon={Activity} />}
          </Panel>
        </div>

        <aside className="min-w-0 space-y-4">
          <Panel title={t(lang, "analytics.tasksByStatus")}>
            <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-slate-100">
              {statusRows.map((row) => row.count > 0 && <span key={row.key} className={row.color} style={{ width: `${(row.count / Math.max(data.tasks.length, 1)) * 100}%` }} />)}
            </div>
            <div className="space-y-3">
              {statusRows.map((row) => (
                <div key={row.key} className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-2 text-secondary"><span className={`size-2 rounded-full ${row.color}`} />{t(lang, row.key)}</span>
                  <span className="font-semibold text-ink">{row.count}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title={t(lang, "analytics.goalsProgress")} description={t(lang, "analytics.totalGoals")}>
            {data.goals.length ? (
              <>
                <div className="mb-3 flex items-end justify-between gap-2">
                  <span className="text-[30px] font-semibold leading-none tracking-tight text-ink">{avgGoalProgress}%</span>
                  <span className="text-xs text-muted">{activeGoals.length} · {t(lang, "analytics.activeGoals")}</span>
                </div>
                <ProgressBar value={avgGoalProgress} tone="green" />
                <div className="mt-4 space-y-3 border-t border-line pt-4">
                  {data.goals.slice(0, 4).map((goal) => (
                    <div key={goal.id}>
                      <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                        <span className="truncate text-secondary">{goal.title}</span><span className="shrink-0 font-medium text-ink">{goal.progress}%</span>
                      </div>
                      <ProgressBar value={goal.progress} tone={goal.progress === 100 ? "green" : "blue"} />
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyState title={t(lang, "analytics.noGoals")} icon={Target} />}
          </Panel>

          <Panel title={t(lang, "analytics.monthlyActivity")} description={t(lang, "analytics.monthlyCopy")}>
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-green-50 text-success"><CheckCircle2 size={18} /></span>
              <div><p className="text-[22px] font-semibold leading-none text-ink">{completedThisMonth}</p><p className="mt-1 text-[11px] text-muted">{t(lang, "analytics.monthlyCopy")}</p></div>
            </div>
          </Panel>
        </aside>
      </div>
    </div>
  );
}
