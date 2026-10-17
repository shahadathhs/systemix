import type { ReactNode } from 'react';

/**
 * Minimal regex tokenizer for TS/JS/bash snippets — zero dependencies.
 * GitHub-dark palette, applied via inline token classes.
 *
 * Groups (in match order): comment, string, keyword, number, call
 */
const TOKEN_RE =
  /(\/\/[^\n]*|#[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(import|export|from|const|let|var|await|async|function|return|new|typeof|if|else|try|catch|finally|throw|true|false|null|undefined|type|interface|extends|default|of|in)\b|\b(\d+(?:\.\d+)?)\b|([A-Za-z_$][\w$]*)(?=\s*\()/g;

const TOKEN_CLASS: Record<number, string> = {
  1: 'text-[#7d8590] italic', // comment
  2: 'text-[#a5d6ff]', // string
  3: 'text-[#ff7b72]', // keyword
  4: 'text-[#79c0ff]', // number
  5: 'text-[#d2a8ff]', // function call
};

/** Highlights code into colored spans. Unknown language → plain text. */
export function highlight(code: string, lang = 'ts'): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(code)) !== null) {
    // '#' starts a comment only in bash — in TS it's a private field/etc.
    if (match[1]?.startsWith('#') && lang !== 'bash') continue;

    if (match.index > last) {
      nodes.push(code.slice(last, match.index));
    }

    const groupIndex = match[1]
      ? 1
      : match[2]
        ? 2
        : match[3]
          ? 3
          : match[4]
            ? 4
            : 5;
    nodes.push(
      <span key={key++} className={TOKEN_CLASS[groupIndex]}>
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }

  if (last < code.length) {
    nodes.push(code.slice(last));
  }
  return nodes;
}
