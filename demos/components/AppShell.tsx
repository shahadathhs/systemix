'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { SiteFooter } from './SiteFooter';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      {/* Full-height bordered frame — the structural container */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto border-x border-zinc-200 flex">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="flex-1 min-w-0 flex flex-col">{children}</main>
      </div>

      <SiteFooter />
    </div>
  );
}
