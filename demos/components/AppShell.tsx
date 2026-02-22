'use client';

import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center">
      <div className="w-full max-w-7xl flex flex-col flex-1">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <div className="flex flex-1 min-h-0">
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          <main
            className="flex-1 min-w-0 overflow-auto scrollbar-hide"
            data-scroll-container
          >
            <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
