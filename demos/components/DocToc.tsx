'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface DocTocProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

export function DocToc({ scrollContainerRef }: DocTocProps) {
  const pathname = usePathname();
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerSelector = '[data-docs-article]';

  useEffect(() => {
    const el =
      scrollContainerRef?.current ?? document.querySelector(containerSelector);
    if (!el) return;

    const headings = el.querySelectorAll('h2, h3');
    const toc: TocItem[] = [];
    headings.forEach((h) => {
      const id =
        h.id ||
        (h.textContent
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '') ??
          '');
      if (id) {
        h.id = id;
        toc.push({
          id,
          text: h.textContent ?? '',
          level: h.tagName === 'H2' ? 2 : 3,
        });
      }
    });
    setItems(toc);
  }, [scrollContainerRef, pathname]);

  useEffect(() => {
    if (items.length === 0) return;

    const el =
      scrollContainerRef?.current ?? document.querySelector(containerSelector);
    if (!el) return;

    const headings = items
      .map(({ id }) => el.querySelector(`#${id}`))
      .filter(Boolean) as HTMLElement[];

    const scrollContainer =
      scrollContainerRef?.current ??
      document.querySelector(containerSelector) ??
      document.documentElement;

    const onScroll = () => {
      const offset = 140;
      let active: string | null = null;
      for (let i = headings.length - 1; i >= 0; i--) {
        const h = headings[i];
        if (h && h.getBoundingClientRect().top <= offset) {
          active = h.id;
          break;
        }
      }
      if (!active && headings[0]) active = headings[0].id;
      setActiveId(active);
    };

    scrollContainer.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => scrollContainer.removeEventListener('scroll', onScroll);
  }, [items, scrollContainerRef, pathname]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const container =
      scrollContainerRef?.current ?? document.querySelector(containerSelector);
    const target = container?.querySelector(`#${id}`) as HTMLElement | null;
    if (target && container) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      const scrollTop =
        container.scrollTop + (targetRect.top - containerRect.top) - 24;
      container.scrollTo({ top: scrollTop, behavior: 'smooth' });
      window.history.replaceState(null, '', `#${id}`);
    }
  };

  if (items.length === 0) return null;

  return (
    <aside className="hidden xl:block w-56 shrink-0 pl-8">
      <nav className="space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          On this page
        </div>
        <ul className="space-y-1.5 text-sm">
          {items.map((item) => (
            <li
              key={item.id}
              className={
                item.level === 3 ? 'pl-4 border-l border-slate-700/80' : ''
              }
            >
              <button
                type="button"
                onClick={(e) => handleClick(e, item.id)}
                className={`block w-full text-left py-0.5 transition-colors cursor-pointer ${
                  activeId === item.id
                    ? 'text-cyan-400 font-medium'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.text}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
