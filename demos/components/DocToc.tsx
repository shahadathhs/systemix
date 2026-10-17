'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

const OFFSET = 96;

export function DocToc() {
  const pathname = usePathname();
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Collect headings from the rendered article
  useEffect(() => {
    const el = document.querySelector('[data-docs-article]');
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
  }, [pathname]);

  // Scroll spy — the page scrolls on window (no inner scroll container)
  useEffect(() => {
    if (items.length === 0) return;

    const onScroll = () => {
      let active: string | null = null;
      for (let i = items.length - 1; i >= 0; i--) {
        const el = document.getElementById(items[i].id);
        if (el && el.getBoundingClientRect().top <= OFFSET) {
          active = el.id;
          break;
        }
      }
      setActiveId(active ?? items[0].id);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - OFFSET;
    window.scrollTo({ top, behavior: 'smooth' });
    window.history.replaceState(null, '', `#${id}`);
  };

  if (items.length === 0) return null;

  return (
    <aside className="hidden xl:block w-52 shrink-0 pl-8">
      <nav className="sticky top-20">
        <div className="hud mb-3">On this page</div>
        <ul className="space-y-1.5 text-[13px]">
          {items.map((item) => (
            <li
              key={item.id}
              className={item.level === 3 ? 'pl-3 border-l border-line' : ''}
            >
              <button
                type="button"
                onClick={(e) => handleClick(e, item.id)}
                className={`block w-full text-left py-0.5 transition-colors cursor-pointer ${
                  activeId === item.id
                    ? 'text-ink font-medium'
                    : 'text-faint hover:text-ink'
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
