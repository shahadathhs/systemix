'use client';

import { DocToc } from '@/components/DocToc';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function DocsLayoutClient({ children }: { children: React.ReactNode }) {
  const articleRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = articleRef.current;
    if (el) el.scrollTop = 0;
  }, [pathname]);

  return (
    <div className="flex h-[calc(100vh-3.5rem-4rem)] min-h-[32rem] gap-8">
      <div
        ref={articleRef}
        className="flex-1 min-w-0 max-w-3xl overflow-y-auto pr-4 scroll-smooth"
        data-docs-article
      >
        {children}
      </div>
      <DocToc scrollContainerRef={articleRef} />
    </div>
  );
}
