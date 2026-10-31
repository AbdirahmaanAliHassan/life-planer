"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  CheckSquare2,
  ChevronDown,
  Compass,
  Goal,
  Languages,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  StickyNote,
} from "lucide-react";
import { useAppData } from "@/hooks/useAppData";
import { t } from "@/lib/translations";

const navigation = [
  { href: "/dashboard", key: "overview", icon: LayoutDashboard },
  { href: "/tasks", key: "tasks", icon: CheckSquare2 },
  { href: "/planner", key: "planner", icon: Compass },
  { href: "/calendar", key: "calendar", icon: CalendarDays },
  { href: "/goals", key: "goals", icon: Goal },
  { href: "/notes", key: "notes", icon: StickyNote },
  { href: "/analytics", key: "analytics", icon: BarChart3 },
];

export default function Sidebar({
  collapsed,
  mobileOpen,
  onToggleCollapsed,
  onCloseMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapsed: () => void;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const { data, setData } = useAppData();
  const lang = data?.settings.language ?? "en";

  function changeLanguage(language: string) {
    if (language !== "en" && language !== "so") return;
    setData((current) => current ? { ...current, settings: { ...current.settings, language } } : current);
  }

  return (
    <>
      {mobileOpen && <button className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[1px] md:hidden" aria-label={t(lang, "common.close")} onClick={onCloseMobile} />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[272px] flex-col border-r border-line bg-white px-3.5 py-5 transition-[width,transform] duration-200 md:sticky md:top-0 md:z-20 md:h-screen md:translate-x-0 ${collapsed ? "md:w-[76px]" : "md:w-[248px]"} ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:shadow-none"}`}>
        <div className={`mb-8 flex h-10 shrink-0 items-center ${collapsed ? "md:h-[76px] md:flex-col md:justify-center md:gap-2" : "justify-between"}`}>
          <Link href="/dashboard" onClick={onCloseMobile} className={`flex min-w-0 items-center gap-3 ${collapsed ? "md:justify-center" : ""}`} aria-label="Daily Life Manager">
            <span className="grid size-9 shrink-0 place-items-center rounded-[11px] bg-[#243b64] text-white shadow-[0_2px_5px_rgb(23_42_70/16%)]">
              <span className="text-[15px] font-semibold tracking-tight">d.</span>
            </span>
            <span className={`min-w-0 leading-tight ${collapsed ? "md:hidden" : ""}`}>
              <span className="block truncate text-[14px] font-semibold tracking-[-0.035em] text-[#172a46]">Daily Life</span>
              <span className="mt-1 block truncate text-[9px] font-semibold tracking-[0.16em] text-[#7b8495]">MANAGER</span>
            </span>
          </Link>
          <button type="button" onClick={onToggleCollapsed} className="icon-button hidden md:inline-grid" aria-label={t(lang, collapsed ? "common.expandSidebar" : "common.collapseSidebar")} title={t(lang, collapsed ? "common.expandSidebar" : "common.collapseSidebar")}>
            {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          </button>
        </div>

        <p className={`mb-2.5 px-2.5 text-[10px] font-semibold tracking-[0.13em] text-[#929bab] ${collapsed ? "md:sr-only" : ""}`}>{t(lang, "nav.workspace")}</p>
        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto" aria-label={t(lang, "nav.workspace")}>
          {navigation.map(({ href, key, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            const label = t(lang, `nav.${key}`);
            return (
              <Link
                key={href}
                href={href}
                onClick={onCloseMobile}
                aria-current={active ? "page" : undefined}
                aria-label={collapsed ? label : undefined}
                title={collapsed ? label : undefined}
                data-active={active}
                className={`nav-link ${collapsed ? "md:justify-center md:px-0" : ""}`}
              >
                <Icon size={18} strokeWidth={1.8} className="shrink-0" />
                <span className={collapsed ? "md:hidden" : ""}>{label}</span>
                {active && <span className="ml-auto size-1.5 shrink-0 rounded-full bg-accent md:hidden" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-line pt-4">
          <p className={`mb-2.5 px-2.5 text-[10px] font-semibold tracking-[0.13em] text-[#929bab] ${collapsed ? "md:sr-only" : ""}`}>{t(lang, "nav.preferences")}</p>
          <Link
            href="/settings"
            onClick={onCloseMobile}
            aria-current={pathname === "/settings" ? "page" : undefined}
            aria-label={collapsed ? t(lang, "nav.settings") : undefined}
            title={collapsed ? t(lang, "nav.settings") : undefined}
            data-active={pathname === "/settings"}
            className={`nav-link ${collapsed ? "md:justify-center md:px-0" : ""}`}
          >
            <Settings size={18} strokeWidth={1.8} className="shrink-0" />
            <span className={collapsed ? "md:hidden" : ""}>{t(lang, "nav.settings")}</span>
          </Link>
          <label className={`sidebar-language mt-1 flex min-h-10 cursor-pointer items-center gap-2.5 rounded-[10px] border border-line bg-white px-2.5 transition-colors hover:border-[#d7dce5] hover:bg-[#f5f7fb] ${collapsed ? "md:justify-center md:border-transparent md:bg-transparent md:px-0 md:hover:border-transparent md:hover:bg-[#f5f7fb]" : ""}`}>
            <Languages size={16} strokeWidth={1.8} className={`shrink-0 text-[#7b8495] ${collapsed ? "md:hidden" : ""}`} />
            <span className={`min-w-0 flex-1 truncate text-xs font-medium text-[#687386] ${collapsed ? "md:hidden" : ""}`}>{t(lang, "common.language")}</span>
            <span className={`relative flex min-w-0 items-center ${collapsed ? "md:w-8 md:justify-center" : "flex-1 justify-end"}`}>
              <select
                aria-label={t(lang, "common.language")}
                value={lang}
                onChange={(event) => changeLanguage(event.target.value)}
                className={`sidebar-language-select min-w-0 flex-1 cursor-pointer appearance-none bg-transparent py-2 pr-5 text-xs font-medium text-[#344054] outline-none ${collapsed ? "md:w-9 md:flex-none md:py-1 md:pr-3 md:text-[10px]" : "text-right"}`}
              >
                <option value="en">{collapsed ? "EN" : t(lang, "common.english")}</option>
                <option value="so">{collapsed ? "SO" : t(lang, "common.somali")}</option>
              </select>
              <ChevronDown size={13} className={`pointer-events-none absolute right-0 shrink-0 text-[#929bab] ${collapsed ? "md:right-0.5" : ""}`} />
            </span>
          </label>
          <div className={`sidebar-profile mt-4 flex min-h-[58px] items-center gap-2.5 rounded-xl border border-transparent px-2 py-2 transition-colors hover:border-line hover:bg-[#f7f8fa] ${collapsed ? "md:justify-center md:px-1.5" : ""}`}>
            <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-[#eaf0fb] text-[11px] font-semibold text-[#243b64]">
              DL
              <span className="absolute right-0 bottom-0 size-2.5 rounded-full border-2 border-white bg-[#16a36a]" aria-label="Online" />
            </span>
            <span className={`min-w-0 flex-1 ${collapsed ? "md:hidden" : ""}`}>
              <span className="block truncate text-xs font-semibold text-[#243044]">{lang === "so" ? "Goob shaqsiyeed" : "Personal workspace"}</span>
              <span className="mt-0.5 block truncate text-[10px] text-[#7b8495]">{lang === "so" ? "Tallaabo tallaabo u soco" : "One step at a time"}</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
