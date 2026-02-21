'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function DocToc({ selector = 'article' }: { selector?: string }) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const el = document.querySelector(selector);
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
  }, [selector]);

  useEffect(() => {
    if (items.length === 0) return;

    const el = document.querySelector(selector);
    if (!el) return;

    const headings = items
      .map(({ id }) => el.querySelector(`#${id}`))
      .filter(Boolean) as HTMLElement[];

    const scrollContainer =
      document.querySelector('[data-scroll-container]') ??
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
  }, [items, selector]);

  if (items.length === 0) return null;

  return (
    <aside className="hidden xl:block w-56 shrink-0 pl-8 self-start sticky top-24">
      <nav className="space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          On this page
        </div>
        <ul className="space-y-1.5 text-sm">
          {items.map((item) => (
            <li
              key={item.id}
              className={
                item.level === 3 ? 'pl-4 border-l border-white/10' : ''
              }
            >
              <Link
                href={`#${item.id}`}
                className={`block py-0.5 transition-colors ${
                  activeId === item.id
                    ? 'text-blue-400 font-medium'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {item.text}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
