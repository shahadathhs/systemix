import { BookOpen, FileText, Github, Lock, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { docsNav } from '@/lib/docs-config';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <nav className="sticky top-24 space-y-6">
            <div className="flex items-center gap-2 text-white font-semibold mb-4">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Documentation
            </div>

            {docsNav.map((section) => (
              <div key={section.title}>
                {'href' in section && section.href ? (
                  <Link
                    href={section.href}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-1.5"
                  >
                    <FileText className="w-4 h-4 shrink-0 opacity-60" />
                    {section.title}
                  </Link>
                ) : (
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </div>
                )}
                {'items' in section && section.items && (
                  <ul className="mt-2 space-y-1 pl-6 border-l border-white/10">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="block text-sm text-gray-400 hover:text-white transition-colors py-1.5 -ml-px pl-4 border-l-2 border-transparent hover:border-blue-500/50"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            <div className="pt-6 border-t border-white/10">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Live Demos
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  href="/password"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-1.5"
                >
                  <Lock className="w-4 h-4 shrink-0" />
                  Password Generator
                </Link>
                <Link
                  href="/passphrase"
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-1.5"
                >
                  <KeyRound className="w-4 h-4 shrink-0" />
                  Passphrase Generator
                </Link>
              </div>
            </div>

            <a
              href="https://github.com/shahadathhs/systemix"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors py-1.5"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </nav>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
