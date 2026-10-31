"use client";

import { Suspense, useState } from "react";
import { ChevronLeft, ChevronRight, Circle, Clock3 } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { getLocale, t } from "@/lib/translations";
import type { Task } from "@/types";
import { EmptyState, PageHeader, Panel } from "@/components/ui";

type ViewMode = "month" | "week" | "day";

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfWeek(date: Date) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  start.setDate(start.getDate() - start.getDay());
  return start;
}

export default function CalendarPage() {
  return <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-white" />}><CalendarContent /></Suspense>;
}

function CalendarContent() {
  const { data } = useAppData();
  const [current, setCurrent] = useState(new Date());
  const [mode, setMode] = useState<ViewMode>("month");
  if (!data) return null;

  const lang = data.settings.language;
  const locale = getLocale(lang);
  const todayKey = localDateKey(new Date());
  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(current);
  const dates = mode === "month"
    ? Array.from({ length: new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate() }, (_, index) => new Date(current.getFullYear(), current.getMonth(), index + 1))
    : mode === "week"
      ? Array.from({ length: 7 }, (_, index) => {
        const date = startOfWeek(current);
        date.setDate(date.getDate() + index);
        return date;
      })
      : [new Date(current.getFullYear(), current.getMonth(), current.getDate())];
  const cells: (Date | null)[] = mode === "month"
    ? [...Array.from({ length: dates[0].getDay() }, () => null), ...dates]
    : dates;
  if (mode === "month") {
    while (cells.length % 7 !== 0) cells.push(null);
  }
  const firstDay = mode === "week" ? dates[0] : mode === "day" ? dates[0] : dates[0];
  const lastDay = mode === "week" ? dates[6] : mode === "day" ? dates[0] : dates[dates.length - 1];
  const rangeLabel = mode === "month"
    ? monthLabel
    : `${new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }).format(firstDay)} – ${new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(lastDay)}`;

  function tasksForDate(date: Date): Task[] {
    const key = localDateKey(date);
    return data!.tasks.filter((task) => task.status !== "cancelled" && (task.deadline?.slice(0, 10) === key || task.scheduledStart?.slice(0, 10) === key))
      .sort((a, b) => a.priority.localeCompare(b.priority));
  }

  function shift(direction: number) {
    const next = new Date(current);
    if (mode === "month") next.setMonth(next.getMonth() + direction);
    else if (mode === "week") next.setDate(next.getDate() + direction * 7);
    else next.setDate(next.getDate() + direction);
    setCurrent(next);
  }

  return (
    <div className="mx-auto max-w-[1240px]">
      <PageHeader title={t(lang, "calendar.title")} subtitle={t(lang, "calendar.subtitle")} />
      <Panel padding="none" className="p-3 sm:p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button type="button" className="button-secondary min-h-9 px-3" onClick={() => setCurrent(new Date())}>{t(lang, "common.today")}</button>
            <div className="flex items-center">
              <button type="button" className="icon-button" onClick={() => shift(-1)} aria-label={t(lang, "calendar.previous")}><ChevronLeft size={18} /></button>
              <button type="button" className="icon-button" onClick={() => shift(1)} aria-label={t(lang, "calendar.next")}><ChevronRight size={18} /></button>
            </div>
            <h2 className="ml-1 text-[15px] font-semibold text-ink">{rangeLabel}</h2>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1">
            {(["month", "week", "day"] as const).map((view) => (
              <button key={view} type="button" onClick={() => setMode(view)} className={`min-h-8 rounded-md px-3 text-xs font-medium transition-colors ${mode === view ? "bg-white text-ink shadow-sm" : "text-secondary hover:text-ink"}`}>
                {t(lang, `calendar.${view}`)}
              </button>
            ))}
          </div>
        </div>

        <div className={`grid ${mode === "day" ? "grid-cols-1" : "grid-cols-7"} border-l border-t border-line`}>
          {mode !== "day" && Array.from({ length: 7 }, (_, day) => {
            const weekday = new Intl.DateTimeFormat(locale, { weekday: "short" }).format(new Date(2024, 0, day + 7));
            return <div key={day} className="border-b border-r border-line bg-slate-50/70 px-1 py-2 text-center text-[10px] font-semibold text-muted sm:py-2.5 sm:text-xs">{weekday}</div>;
          })}
          {cells.map((date, index) => {
            const dayTasks = date ? tasksForDate(date) : [];
            const isCurrentMonth = date?.getMonth() === current.getMonth();
            const key = date ? localDateKey(date) : `blank-${index}`;
            return (
              <button
                type="button"
                key={key}
                disabled={!date}
                onClick={() => { if (date) { setCurrent(date); if (mode === "month") setMode("day"); } }}
                className={`min-w-0 border-b border-r border-line p-1.5 text-left transition-colors sm:p-2.5 ${mode === "month" ? "min-h-[82px] sm:min-h-[112px]" : mode === "week" ? "min-h-[130px] sm:min-h-[180px]" : "min-h-[260px]"} ${date ? "bg-white hover:bg-slate-50/70" : "bg-slate-50/50"} ${mode === "day" ? "col-span-1 p-4" : ""}`}
              >
                {date && (
                  <>
                    <span className={`grid size-7 place-items-center rounded-full text-xs ${key === todayKey ? "bg-navy font-semibold text-white" : isCurrentMonth || mode !== "month" ? "text-ink" : "text-muted"}`}>
                      {date.getDate()}
                    </span>
                    <div className="mt-1.5 space-y-1">
                      {dayTasks.slice(0, mode === "month" ? 2 : 5).map((task) => (
                        <span key={task.id} className={`flex min-w-0 items-center gap-1 truncate rounded-md px-1.5 py-1 text-[9px] leading-3 sm:text-[10px] ${task.deadline?.slice(0, 10) === key ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-[#315fd4]"}`}>
                          <Circle size={6} fill="currentColor" className="shrink-0" />
                          <span className="truncate">{task.title}</span>
                        </span>
                      ))}
                      {dayTasks.length > (mode === "month" ? 2 : 5) && <span className="block px-1 text-[9px] text-muted">+{dayTasks.length - (mode === "month" ? 2 : 5)}</span>}
                    </div>
                  </>
                )}
              </button>
            );
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-secondary">
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#4f7df3]" />{t(lang, "tasks.title")}</span>
          <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-[#e5a13a]" />{t(lang, "common.deadline")}</span>
        </div>
      </Panel>

      {mode === "day" && (
        <Panel className="mt-4" title={new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric" }).format(current)}>
          {tasksForDate(current).length ? (
            <div className="space-y-2">
              {tasksForDate(current).map((task) => (
                <div key={task.id} className="flex items-start gap-3 rounded-xl border border-line p-3.5">
                  <span className={`mt-1.5 size-2 shrink-0 rounded-full ${task.deadline?.slice(0, 10) === localDateKey(current) ? "bg-warning" : "bg-accent"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-medium text-ink">{task.title}</p>
                    <p className="mt-1 text-xs text-muted">{task.deadline?.slice(0, 10) === localDateKey(current) ? t(lang, "common.deadline") : t(lang, "calendar.day")}</p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted"><Clock3 size={12} />{task.estimatedDuration} {t(lang, "common.minutes")}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState title={t(lang, "calendar.noItems")} />}
        </Panel>
      )}
    </div>
  );
}
