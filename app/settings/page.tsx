"use client";

import { useRef, useState } from "react";
import { Download, FileUp, Trash2 } from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { clearData, exportData, importData } from "@/lib/storage/storage";
import { t } from "@/lib/translations";
import { PageHeader, Panel } from "@/components/ui";

export default function Settings() {
  const { data, setData } = useAppData();
  const [feedback, setFeedback] = useState<{ message: string; error: boolean } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  if (!data) return null;

  const lang = data.settings.language;
  function showFeedback(message: string, error = false) {
    setFeedback({ message, error });
    window.setTimeout(() => setFeedback(null), 3200);
  }

  function updateHours(field: "workStart" | "workEnd", value: string) {
    setData((current) => current ? { ...current, settings: { ...current.settings, [field]: value } } : current);
  }

  function downloadBackup() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "daily-life-manager-backup.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showFeedback(t(lang, "settings.exported"));
  }

  async function restoreBackup(file?: File) {
    if (!file) return;
    try {
      const restored = importData(await file.text());
      setData(restored);
      showFeedback(t(lang, "settings.imported"));
    } catch (error) {
      console.error("Unable to import Daily Life Manager backup", error);
      showFeedback(t(lang, "settings.invalidImport"), true);
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function removeAllData() {
    if (!window.confirm(t(lang, "settings.clearConfirm"))) return;
    clearData();
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader title={t(lang, "settings.title")} subtitle={t(lang, "settings.subtitle")} />
      <div className="space-y-4">
        <Panel title={t(lang, "settings.preferences")}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="form-field">{t(lang, "settings.startTime")}
              <input type="time" className="form-control" value={data.settings.workStart} onChange={(event) => updateHours("workStart", event.target.value)} />
            </label>
            <label className="form-field">{t(lang, "settings.endTime")}
              <input type="time" className="form-control" value={data.settings.workEnd} onChange={(event) => updateHours("workEnd", event.target.value)} />
            </label>
          </div>
        </Panel>

        <Panel title={t(lang, "settings.data")} description={t(lang, "settings.dataCopy")}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={downloadBackup} className="button-secondary justify-start"><Download size={16} />{t(lang, "settings.export")}</button>
            <button type="button" onClick={() => fileInput.current?.click()} className="button-secondary justify-start"><FileUp size={16} />{t(lang, "settings.chooseFile")}</button>
            <input ref={fileInput} type="file" accept="application/json,.json" className="sr-only" aria-label={t(lang, "settings.chooseFile")} onChange={(event) => void restoreBackup(event.target.files?.[0])} />
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">{t(lang, "settings.importCopy")}</p>
        </Panel>

        <Panel title={t(lang, "settings.clear")} description={t(lang, "settings.clearCopy")}>
          <button type="button" onClick={removeAllData} className="button-danger"><Trash2 size={15} />{t(lang, "settings.clear")}</button>
        </Panel>
      </div>
      {feedback && <div role={feedback.error ? "alert" : "status"} className={`toast ${feedback.error ? "!border-red-100 !text-danger" : ""}`}>{feedback.message}</div>}
    </div>
  );
}
