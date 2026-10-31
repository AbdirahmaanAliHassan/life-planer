"use client";

import type { ReactNode } from "react";
import {
  Check,
  Clock3,
  Pencil,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import type { Task } from "@/types";
import { getLocale, t } from "@/lib/translations";

export function PageHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-accent">{eyebrow}</p>}
        <h1 className="text-[27px] font-semibold leading-tight tracking-[-0.035em] text-ink sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </header>
  );
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  padding = "default",
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padding?: "default" | "none";
}) {
  return (
    <section className={`surface-card min-w-0 ${padding === "default" ? "p-5" : ""} ${className}`}>
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            {title && <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>}
            {description && <p className="mt-1 text-xs leading-5 text-muted">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  detail,
  tone = "blue",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  detail?: string;
  tone?: "blue" | "green" | "amber" | "slate";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-accent",
    green: "bg-green-50 text-success",
    amber: "bg-amber-50 text-warning",
    slate: "bg-slate-100 text-slate-600",
  }[tone];
  return (
    <div className="surface-card flex min-h-[136px] flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-secondary">{label}</p>
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${toneClass}`}><Icon size={17} strokeWidth={1.8} /></span>
      </div>
      <div>
        <p className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-ink">{value}</p>
        {detail && <p className="mt-2 text-xs text-muted">{detail}</p>}
      </div>
    </div>
  );
}

export function ProgressBar({ value, tone = "blue" }: { value: number; tone?: "blue" | "green" }) {
  return (
    <div
      className="h-2 overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-valuenow={Math.max(0, Math.min(100, value))}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${tone === "green" ? "bg-success" : "bg-accent"}`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({ title, description, icon: Icon }: { title: string; description?: string; icon?: LucideIcon }) {
  return (
    <div className="grid min-h-40 place-items-center rounded-xl border border-dashed border-line bg-slate-50/60 px-5 py-8 text-center">
      <div>
        {Icon && <span className="mx-auto mb-3 grid size-10 place-items-center rounded-xl bg-white text-muted shadow-sm"><Icon size={19} /></span>}
        <p className="text-sm font-medium text-secondary">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-muted">{description}</p>}
      </div>
    </div>
  );
}

export function PriorityBadge({ priority, lang }: { priority: Task["priority"]; lang: "en" | "so" }) {
  const styles = {
    P1: "bg-red-50 text-danger",
    P2: "bg-orange-50 text-orange-700",
    P3: "bg-blue-50 text-accent",
    P4: "bg-slate-100 text-secondary",
  }[priority];
  return <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold ${styles}`}><span className="size-1.5 rounded-full bg-current" />{t(lang, `priority.${priority}`)}</span>;
}

export function StatusBadge({ status, lang }: { status: Task["status"]; lang: "en" | "so" }) {
  const content = {
    pending: ["statusPending", "bg-slate-100 text-secondary"],
    in_progress: ["statusInProgress", "bg-blue-50 text-accent"],
    completed: ["statusCompleted", "bg-green-50 text-success"],
    cancelled: ["statusCancelled", "bg-red-50 text-danger"],
  }[status];
  return <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-medium ${content[1]}`}>{t(lang, `tasks.${content[0]}`)}</span>;
}

export function TaskRow({
  task,
  lang,
  onToggle,
  onEdit,
  onDelete,
  compact = false,
}: {
  task: Task;
  lang: "en" | "so";
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}) {
  const categoryLabel = t(lang, `categories.${task.category}`);
  const category = categoryLabel.startsWith("categories.") ? task.category : categoryLabel;
  const deadline = task.deadline
    ? new Intl.DateTimeFormat(getLocale(lang), { month: "short", day: "numeric" }).format(new Date(`${task.deadline.slice(0, 10)}T12:00:00`))
    : null;
  return (
    <div className={`group flex min-w-0 items-start gap-3 ${compact ? "py-2.5" : "rounded-xl border border-line bg-white px-3.5 py-3 transition-colors hover:border-slate-300"}`}>
      {onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          aria-label={task.status === "completed" ? t(lang, "tasks.statusPending") : t(lang, "tasks.statusCompleted")}
          className={`mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full border transition-colors ${task.status === "completed" ? "border-success bg-success text-white" : "border-slate-300 text-transparent hover:border-accent hover:text-accent"}`}
        >
          <Check size={11} strokeWidth={3} />
        </button>
      ) : (
        <span className={`mt-1 size-2 shrink-0 rounded-full ${task.status === "completed" ? "bg-success" : "bg-accent"}`} />
      )}
      <div className="min-w-0 flex-1">
        <p className={`break-words text-[13px] font-medium leading-5 ${task.status === "completed" ? "text-muted line-through" : "text-ink"}`}>{task.title}</p>
        {!compact && task.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted">{task.description}</p>}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} lang={lang} />
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-secondary">{category}</span>
          {deadline && <span className="inline-flex items-center gap-1 text-[11px] text-muted"><Clock3 size={12} />{deadline}</span>}
          {task.estimatedDuration > 0 && <span className="text-[11px] text-muted">{task.estimatedDuration} {t(lang, "common.minutes")}</span>}
          {!compact && <StatusBadge status={task.status} lang={lang} />}
        </div>
      </div>
      {(onEdit || onDelete) && (
        <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-within:opacity-100">
          {onEdit && <button type="button" className="icon-button" aria-label={t(lang, "common.edit")} onClick={onEdit}><Pencil size={15} /></button>}
          {onDelete && <button type="button" className="icon-button icon-button-danger" aria-label={t(lang, "common.delete")} onClick={onDelete}><Trash2 size={15} /></button>}
        </div>
      )}
    </div>
  );
}

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="search-field">
      <span className="sr-only">{placeholder}</span>
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="size-4 shrink-0 text-muted">
        <circle cx="8.8" cy="8.8" r="5.8" stroke="currentColor" strokeWidth="1.6" />
        <path d="m13.2 13.2 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

export function IconLabel({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return <span className="inline-flex items-center gap-2"><Icon size={15} strokeWidth={1.8} />{children}</span>;
}
