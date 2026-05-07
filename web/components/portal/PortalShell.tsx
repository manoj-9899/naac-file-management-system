"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

export type PortalUser = {
  name: string;
  email: string;
  role: "TEACHER" | "HOD";
};

export function PortalShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: PortalUser;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[var(--portal-canvas)] text-slate-900">
      <AppSidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar user={user} onMenu={() => setSidebarOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
