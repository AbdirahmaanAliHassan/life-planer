"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useAppData } from "@/hooks/useAppData";
import { t } from "@/lib/translations";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data } = useAppData();
  const lang = data?.settings.language ?? "en";
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapsed={() => setCollapsed((value) => !value)}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="min-w-0 flex-1">
        <div className="mx-auto min-h-screen w-full max-w-[1600px] px-4 pb-10 pt-5 sm:px-7 sm:pt-7 lg:px-10 lg:pt-9">
          <div className="mb-3 flex items-center md:hidden">
            <button type="button" className="icon-button -ml-2" onClick={() => setMobileOpen(true)} aria-label={t(lang, "common.openMenu")}>
              <Menu size={20} />
            </button>
            <span className="ml-1 text-xs font-semibold tracking-wide text-secondary">DAILY LIFE</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
