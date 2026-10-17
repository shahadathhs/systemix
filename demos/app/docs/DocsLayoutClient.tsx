'use client';

import { DocToc } from '@/components/DocToc';

export function DocsLayoutClient({ children }: { children: React.ReactNode }) {
  // The page scrolls on window — TOC uses window scroll + spy
  return (
    <div className="flex gap-10 w-full max-w-6xl mx-auto px-6 sm:px-10 py-10">
      <div className="flex-1 min-w-0 max-w-3xl" data-docs-article>
        {children}
      </div>
      <DocToc />
    </div>
  );
}
