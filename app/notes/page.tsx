"use client";

import { useState } from "react";
import { Pin, Plus, Search, StickyNote, Trash2, X } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { uid } from "@/lib/storage/storage-keys";
import { getLocale, t } from "@/lib/translations";
import type { Note } from "@/types";
import { EmptyState, PageHeader, SearchField } from "@/components/ui";

export default function Notes() {
  const { data, setData } = useAppData();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);
  const [feedback, setFeedback] = useState("");
  if (!data) return null;

  const lang = data.settings.language;
  const notes = [...data.notes]
    .filter((note) => `${note.title} ${note.content}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));

  function openNew() {
    const now = new Date().toISOString();
    setEditing({ id: "", title: "", content: "", category: "general", pinned: false, createdAt: now, updatedAt: now });
  }

  function saveNote() {
    if (!editing) return;
    const title = editing.title.trim();
    if (!title && !editing.content.trim()) return;
    const now = new Date().toISOString();
    if (editing.id) {
      setData((current) => current ? { ...current, notes: current.notes.map((note) => note.id === editing.id ? { ...editing, title: title || t(lang, "notes.untitled"), updatedAt: now } : note) } : current);
    } else {
      const note: Note = { ...editing, id: uid(), title: title || t(lang, "notes.untitled"), updatedAt: now };
      setData((current) => current ? { ...current, notes: [note, ...current.notes] } : current);
    }
    setEditing(null);
    setFeedback(t(lang, "common.save"));
    window.setTimeout(() => setFeedback(""), 2200);
  }

  function updateDraft(field: "title" | "content", value: string) {
    if (!editing) return;
    const now = new Date().toISOString();
    let updated = { ...editing, [field]: value, updatedAt: now };
    if (!updated.id && (updated.title.trim() || updated.content.trim())) {
      updated = { ...updated, id: uid() };
      setData((current) => current ? { ...current, notes: [updated, ...current.notes] } : current);
    } else if (updated.id) {
      setData((current) => current ? { ...current, notes: current.notes.map((note) => note.id === updated.id ? updated : note) } : current);
    }
    setEditing(updated);
    if (updated.id) {
      setFeedback(t(lang, "notes.autosaved"));
      window.setTimeout(() => setFeedback(""), 2200);
    }
  }

  function togglePin(id: string) {
    setData((current) => current ? {
      ...current,
      notes: current.notes.map((note) => note.id === id ? { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() } : note),
    } : current);
  }

  function deleteNote(id: string, title: string) {
    if (!window.confirm(`${t(lang, "common.delete")} “${title}”?`)) return;
    setData((current) => current ? { ...current, notes: current.notes.filter((note) => note.id !== id) } : current);
  }

  return (
    <div className="mx-auto max-w-[1120px]">
      <PageHeader
        title={t(lang, "notes.title")}
        subtitle={t(lang, "notes.subtitle")}
        action={<button type="button" className="button-primary" onClick={openNew}><Plus size={16} />{t(lang, "notes.newNote")}</button>}
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField value={query} onChange={setQuery} placeholder={t(lang, "notes.searchPlaceholder")} />
        <span className="text-xs text-muted">{notes.length} · {t(lang, "nav.notes")}</span>
      </div>
      {notes.length ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <article key={note.id} className="group flex min-h-[190px] min-w-0 flex-col rounded-2xl border border-line bg-white p-5 shadow-[0_1px_2px_rgb(23_32_51/3%)] transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between gap-2">
                <span className="grid size-9 place-items-center rounded-xl bg-[#f2f4f8] text-secondary"><StickyNote size={16} /></span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => togglePin(note.id)} className={`icon-button ${note.pinned ? "bg-blue-50 text-accent" : ""}`} aria-label={t(lang, note.pinned ? "common.unpin" : "common.pin")} title={t(lang, note.pinned ? "common.unpin" : "common.pin")}><Pin size={15} /></button>
                  <button type="button" onClick={() => deleteNote(note.id, note.title)} className="icon-button icon-button-danger" aria-label={t(lang, "common.delete")}><Trash2 size={15} /></button>
                </div>
              </div>
              <button type="button" onClick={() => setEditing(note)} className="mt-4 min-w-0 text-left">
                <span className="block break-words text-sm font-semibold text-ink">{note.title || t(lang, "notes.untitled")}</span>
                <span className="mt-2 line-clamp-4 block whitespace-pre-wrap break-words text-xs leading-5 text-secondary">{note.content}</span>
              </button>
              <div className="mt-auto flex items-center justify-between pt-4 text-[10px] text-muted">
                <span>{new Intl.DateTimeFormat(getLocale(lang), { month: "short", day: "numeric" }).format(new Date(note.updatedAt))}</span>
                {note.pinned && <span className="inline-flex items-center gap-1 text-accent"><Pin size={11} />{t(lang, "common.pinned")}</span>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title={query ? t(lang, "common.noResults") : t(lang, "notes.noNotes")} description={t(lang, "notes.subtitle")} icon={Search} />
      )}

      {feedback && <div role="status" className="toast">{feedback}</div>}
      {editing && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="note-modal-title">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 id="note-modal-title" className="text-lg font-semibold text-ink">{editing.id ? t(lang, "common.edit") : t(lang, "notes.newNote")}</h2>
              <button type="button" className="icon-button" onClick={() => setEditing(null)} aria-label={t(lang, "common.close")}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <label className="form-field">
                <span className="sr-only">{t(lang, "common.title")}</span>
                <input autoFocus maxLength={120} className="form-control text-base font-semibold" value={editing.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder={t(lang, "notes.noteTitle")} />
              </label>
              <label className="form-field">
                <span className="sr-only">{t(lang, "common.description")}</span>
                <textarea rows={9} className="form-control resize-y leading-6" value={editing.content} onChange={(event) => updateDraft("content", event.target.value)} placeholder={t(lang, "notes.noteContent")} />
              </label>
              <div className="flex flex-col-reverse gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
                <button type="button" className="button-secondary" onClick={() => setEditing(null)}>{t(lang, "common.cancel")}</button>
                <button type="button" className="button-primary" onClick={saveNote}>{t(lang, "notes.addNote")}</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
