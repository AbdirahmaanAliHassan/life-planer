"use client";

import { useState, type FormEvent } from "react";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { uid } from "@/lib/storage/storage-keys";
import { t } from "@/lib/translations";
import type { Priority, Task } from "@/types";
import { EmptyState, PageHeader, Panel, SearchField, TaskRow } from "@/components/ui";

type TaskForm = {
  title: string;
  description: string;
  category: string;
  priority: Priority;
  deadline: string;
  estimatedDuration: string;
};

const emptyForm: TaskForm = {
  title: "",
  description: "",
  category: "general",
  priority: "P3",
  deadline: "",
  estimatedDuration: "30",
};

export default function Tasks() {
  const { data, setData } = useAppData();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"priority" | "deadline">("priority");
  const [form, setForm] = useState<TaskForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  if (!data) return null;

  const lang = data.settings.language;
  const activeCount = data.tasks.filter((task) => task.status !== "completed" && task.status !== "cancelled").length;
  const completedCount = data.tasks.filter((task) => task.status === "completed").length;

  const filteredTasks = data.tasks.filter((task) => {
    const matchesQuery = `${task.title} ${task.description} ${task.category}`.toLowerCase().includes(query.trim().toLowerCase());
    const matchesStatus = filter === "all" || (filter === "active" ? task.status !== "completed" && task.status !== "cancelled" : task.status === "completed");
    return matchesQuery && matchesStatus;
  }).sort((a, b) => {
    if (sortBy === "deadline") {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    }
    return a.priority.localeCompare(b.priority);
  });

  function openNewTask() {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }

  function openEditTask(task: Task) {
    setForm({
      title: task.title,
      description: task.description,
      category: task.category,
      priority: task.priority,
      deadline: task.deadline?.slice(0, 10) ?? "",
      estimatedDuration: String(task.estimatedDuration),
    });
    setEditingId(task.id);
    setModalOpen(true);
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = form.title.trim();
    if (!title) return;
    const timestamp = new Date().toISOString();
    const updatedTask = (task: Task): Task => ({
      ...task,
      title,
      description: form.description.trim(),
      category: form.category.trim() || "general",
      priority: form.priority,
      deadline: form.deadline || null,
      estimatedDuration: Math.max(1, Number(form.estimatedDuration) || 30),
      updatedAt: timestamp,
    });

    if (editingId) {
      setData((current) => current ? { ...current, tasks: current.tasks.map((task) => task.id === editingId ? updatedTask(task) : task) } : current);
    } else {
      const task: Task = updatedTask({
        id: uid(), title, description: "", category: "general", priority: form.priority,
        status: "pending", estimatedDuration: 30, deadline: null, createdAt: timestamp,
        updatedAt: timestamp, scheduledStart: null, scheduledEnd: null, locked: false, notes: "",
      });
      setData((current) => current ? { ...current, tasks: [task, ...current.tasks] } : current);
    }
    setModalOpen(false);
  }

  function toggleTask(id: string) {
    setData((current) => current ? {
      ...current,
      tasks: current.tasks.map((task) => task.id === id
        ? { ...task, status: task.status === "completed" ? "pending" : "completed", updatedAt: new Date().toISOString() }
        : task),
    } : current);
  }

  function removeTask(id: string) {
    if (!window.confirm(t(lang, "tasks.deleteConfirm"))) return;
    setData((current) => current ? { ...current, tasks: current.tasks.filter((task) => task.id !== id) } : current);
  }

  const tabs = [
    { id: "all" as const, label: t(lang, "tasks.allTasks"), count: data.tasks.length },
    { id: "active" as const, label: t(lang, "tasks.active"), count: activeCount },
    { id: "completed" as const, label: t(lang, "tasks.completed"), count: completedCount },
  ];

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title={t(lang, "tasks.title")}
        subtitle={t(lang, "tasks.subtitle")}
        action={<button type="button" onClick={openNewTask} className="button-primary"><Plus size={16} />{t(lang, "tasks.newTask")}</button>}
      />
      <Panel padding="none">
        <div className="flex flex-col gap-3 border-b border-line px-4 pt-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-medium transition-colors ${filter === tab.id ? "bg-[#edf2ff] text-navy" : "text-secondary hover:bg-slate-50"}`}
              >
                {tab.label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === tab.id ? "bg-white text-navy" : "bg-slate-100 text-muted"}`}>{tab.count}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2 pb-4 sm:flex-row">
            <SearchField value={query} onChange={setQuery} placeholder={t(lang, "tasks.searchPlaceholder")} />
            <label className="flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-line bg-white px-3 text-xs text-secondary">
              <SlidersHorizontal size={14} className="text-muted" />
              <span className="sr-only">{t(lang, "common.filter")}</span>
              <select value={sortBy} onChange={(event) => setSortBy(event.target.value as "priority" | "deadline")} className="max-w-[150px] bg-transparent outline-none">
                <option value="priority">{t(lang, "common.priority")}</option>
                <option value="deadline">{t(lang, "common.deadline")}</option>
              </select>
            </label>
          </div>
        </div>
        <div className="p-3 sm:p-5">
          {filteredTasks.length ? (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskRow key={task.id} task={task} lang={lang} onToggle={() => toggleTask(task.id)} onEdit={() => openEditTask(task)} onDelete={() => removeTask(task.id)} />
              ))}
            </div>
          ) : (
            <EmptyState title={query ? t(lang, "common.noResults") : t(lang, "tasks.noTasks")} icon={Search} />
          )}
        </div>
      </Panel>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="task-modal-title" className="text-lg font-semibold tracking-tight text-ink">{t(lang, editingId ? "tasks.editTitle" : "tasks.addTitle")}</h2>
                <p className="mt-1 text-xs text-muted">{t(lang, "tasks.subtitle")}</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="icon-button" aria-label={t(lang, "common.close")}><X size={18} /></button>
            </div>
            <form onSubmit={saveTask} className="space-y-4">
              <label className="form-field">{t(lang, "common.title")}
                <input autoFocus required maxLength={120} className="form-control" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={t(lang, "tasks.taskTitle")} />
              </label>
              <label className="form-field">{t(lang, "common.description")}
                <textarea rows={3} className="form-control resize-y" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder={t(lang, "tasks.taskDescription")} />
              </label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="form-field">{t(lang, "common.category")}
                  <input className="form-control" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder={t(lang, "tasks.categoryPlaceholder")} />
                </label>
                <label className="form-field">{t(lang, "common.priority")}
                  <select className="form-control" value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value as Priority })}>
                    {(["P1", "P2", "P3", "P4"] as const).map((priority) => <option key={priority} value={priority}>{t(lang, `priority.${priority}`)}</option>)}
                  </select>
                </label>
                <label className="form-field">{t(lang, "common.deadline")}
                  <input type="date" className="form-control" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
                </label>
                <label className="form-field">{t(lang, "common.duration")}
                  <input type="number" min="1" max="1440" className="form-control" value={form.estimatedDuration} onChange={(event) => setForm({ ...form, estimatedDuration: event.target.value })} />
                </label>
              </div>
              <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
                <button type="button" className="button-secondary" onClick={() => setModalOpen(false)}>{t(lang, "common.cancel")}</button>
                <button type="submit" className="button-primary">{t(lang, editingId ? "common.save" : "tasks.saveTask")}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
