"use client";

import { useState } from "react";
import { AlarmClock, ArrowDown, ArrowUp, CalendarClock, CircleHelp, Clock3, Coffee, ListTodo, Sparkles } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { t } from "@/lib/translations";
import type { Task } from "@/types";
import { EmptyState, PageHeader, Panel, PriorityBadge } from "@/components/ui";

export default function Planner() {
  const { data } = useAppData();
  const [plan, setPlan] = useState<Task[] | null>(null);
  const [generated, setGenerated] = useState(false);
  if (!data) return null;

  const lang = data.settings.language;
  const activeTasks = data.tasks.filter((task) => task.status !== "completed" && task.status !== "cancelled");
  const unscheduledTasks = plan ? activeTasks.filter((task) => !plan.some((plannedTask) => plannedTask.id === task.id)) : activeTasks;
  function generate() {
    const pending = data!.tasks.filter((task) => task.status !== "completed" && task.status !== "cancelled");
    const sorted = [...pending].sort((a, b) => a.priority.localeCompare(b.priority));
    setPlan(sorted);
    setGenerated(true);
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <PageHeader
        title={t(lang, "planner.title")}
        subtitle={t(lang, "planner.subtitle")}
        action={<button type="button" className="button-primary" onClick={generate}><Sparkles size={16} />{t(lang, "planner.generate")}</button>}
      />
      {generated && <div role="status" className="mb-5 rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-xs font-medium text-success">{t(lang, "planner.regenerated")}</div>}

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.8fr)]">
        <Panel
          title={t(lang, "planner.planTitle")}
          description={t(lang, "planner.priorityOrder")}
          action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-secondary">{(plan ?? activeTasks).length}</span>}
        >
          {!plan ? (
            <EmptyState title={t(lang, "planner.noPlan")} description={t(lang, "planner.generated")} icon={CalendarClock} />
          ) : plan.length ? (
            <ol className="relative ml-3 space-y-3 border-l border-dashed border-slate-200 pl-5">
              {plan.map((task, index) => (
                <li key={task.id} className="relative">
                  <span className="absolute -left-[27px] top-4 grid size-5 place-items-center rounded-full border border-line bg-white text-[10px] font-semibold text-secondary">{index + 1}</span>
                  <article className="rounded-xl border border-line bg-white p-3.5 transition-colors hover:border-slate-300">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="break-words text-[13px] font-semibold text-ink">{task.title}</h3>
                        {task.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{task.description}</p>}
                      </div>
                      <PriorityBadge priority={task.priority} lang={lang} />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-3 text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1.5"><Clock3 size={13} />{task.estimatedDuration} {t(lang, "common.minutes")}</span>
                      <span className="capitalize">{t(lang, `categories.${task.category}`).startsWith("categories.") ? task.category : t(lang, `categories.${task.category}`)}</span>
                      {index < plan.length - 1 && <span className="ml-auto inline-flex items-center gap-1"><ArrowDown size={12} />{t(lang, "planner.priorityOrder")}</span>}
                      {index > 0 && index === plan.length - 1 && <span className="ml-auto inline-flex items-center gap-1"><ArrowUp size={12} />{t(lang, "planner.priorityOrder")}</span>}
                    </div>
                  </article>
                </li>
              ))}
            </ol>
          ) : <EmptyState title={plan ? t(lang, "planner.allPlanned") : t(lang, "planner.noTasks")} icon={ListTodo} />}
        </Panel>

        <aside className="space-y-4">
          <Panel title={t(lang, "planner.unscheduled")} description={`${unscheduledTasks.length} ${t(lang, "tasks.active").toLowerCase()}`}>
            {unscheduledTasks.length ? (
              <div className="space-y-2">
                {unscheduledTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-start gap-2.5 rounded-lg bg-slate-50 p-3">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-slate-300" />
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-xs font-medium text-ink">{task.title}</p>
                      <p className="mt-1 text-[10px] text-muted">{task.estimatedDuration} {t(lang, "common.minutes")}</p>
                    </div>
                    <PriorityBadge priority={task.priority} lang={lang} />
                  </div>
                ))}
                {unscheduledTasks.length > 5 && <p className="px-1 text-[11px] text-muted">+{unscheduledTasks.length - 5}</p>}
              </div>
            ) : <EmptyState title={t(lang, "planner.noTasks")} icon={ListTodo} />}
          </Panel>

          <Panel title={t(lang, "planner.workHours")}>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-2 text-secondary"><AlarmClock size={15} />{t(lang, "planner.start")}</span>
              <span className="font-semibold text-ink">{data.settings.workStart}</span>
            </div>
            <div className="my-3 border-t border-line" />
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="inline-flex items-center gap-2 text-secondary"><AlarmClock size={15} />{t(lang, "planner.end")}</span>
              <span className="font-semibold text-ink">{data.settings.workEnd}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-3 text-xs">
              <span className="inline-flex items-center gap-2 text-secondary"><Coffee size={15} />{t(lang, "planner.breakDuration")}</span>
              <span className="font-semibold text-ink">{data.settings.breakDuration} {t(lang, "common.minutes")}</span>
            </div>
          </Panel>

          <div className="rounded-2xl border border-[#dce6fb] bg-[#f0f4ff] p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-accent"><CircleHelp size={16} /></span>
              <div>
                <h2 className="text-[13px] font-semibold text-[#243b64]">{t(lang, "planner.howItWorks")}</h2>
                <p className="mt-1.5 text-xs leading-5 text-[#657695]">{t(lang, "planner.explanation")}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
