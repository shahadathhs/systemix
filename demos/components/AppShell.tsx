'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { SiteFooter } from './SiteFooter';
import { usePathname } from 'next/navigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  // The landing page is a marketing surface — no sidebar, full-width frame
  const showSidebar = pathname !== '/';

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Navbar
        onMenuClick={showSidebar ? () => setSidebarOpen(true) : undefined}
      />

      {/* Full-height bordered frame — the structural container */}
      <div className="flex-1 w-full max-w-[1280px] mx-auto border-x border-line flex">
        {showSidebar && <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />}
        <main className="flex-1 min-w-0 flex flex-col">{children}</main>
      </div>

      <SiteFooter />
    </div>
  );
}
