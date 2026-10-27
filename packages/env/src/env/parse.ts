const TRUE_VALUES = new Set(['true', '1', 'yes', 'on']);
const FALSE_VALUES = new Set(['false', '0', 'no', 'off']);

/**
 * Parse a string to boolean. Accepts (case-insensitive): true/false, 1/0,
 * yes/no, on/off.
 * @param raw - Raw string value
 * @throws When value is not a valid boolean
 */
export function parseBoolean(raw: string): boolean {
  const lower = raw.toLowerCase().trim();
  if (TRUE_VALUES.has(lower)) return true;
  if (FALSE_VALUES.has(lower)) return false;
  throw new Error(`Invalid boolean value: "${raw}"`);
}

const DECIMAL = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i;

/**
 * Parse a string to a finite decimal number. Rejects empty and whitespace-only
 * input (which `Number()` turns into 0) and non-decimal forms such as `0x10`,
 * `0b1`, `Infinity` or `1_000`.
 * @param raw - Raw string value
 * @throws When value is not a valid number
 */
export function parseNumber(raw: string): number {
  const text = raw.trim();
  const n = Number(text);
  if (!DECIMAL.test(text) || !Number.isFinite(n)) {
    throw new Error(`Invalid number value: "${raw}"`);
  }
  return n;
}

const KEY = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=\s*/;
const DOUBLE_ESCAPES: Record<string, string> = {
  n: '\n',
  r: '\r',
  t: '\t',
  '"': '"',
  '\\': '\\',
};

/**
 * Parse .env file content into key-value pairs.
 *
 * - `KEY=value`, with an optional `export ` prefix; `#` lines are comments.
 * - Unquoted values end at an inline ` #` comment and are trimmed.
 * - `"double quoted"` values may span lines and support `\n \r \t \" \\`;
 *   other backslashes are kept literally.
 * - `'single quoted'` values are literal (and may span lines).
 * - Invalid keys and lines without `=` are skipped.
 *
 * @param content - Raw file content
 * @returns Map of KEY -> value strings
 */
export function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  const lines = content.replace(/\r\n?/g, '\n').split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trimStart();
    if (!line || line.startsWith('#')) continue;

    const match = KEY.exec(line);
    if (!match) continue;
    const key = match[1];
    const rest = line.slice(match[0].length);
    let value: string;

    const quote = rest[0];
    if (quote === '"' || quote === "'") {
      // Collect text up to the closing quote, across lines if needed.
      let text = rest.slice(1);
      let end = findClosingQuote(text, quote);
      let last = i;
      while (end === -1 && last + 1 < lines.length) {
        last += 1;
        text += '\n' + lines[last];
        end = findClosingQuote(text, quote);
      }
      if (end === -1) {
        // Unterminated: treat the first line as a plain unquoted value.
        value = stripInlineComment(rest);
      } else {
        const body = text.slice(0, end);
        value =
          quote === '"'
            ? body.replace(/\\(.)/gs, (m, c: string) => DOUBLE_ESCAPES[c] ?? m)
            : body;
        i = last;
      }
    } else {
      value = stripInlineComment(rest);
    }

    if (key !== '__proto__') result[key] = value;
  }

  return result;
}

function findClosingQuote(text: string, quote: string): number {
  for (let i = 0; i < text.length; i++) {
    if (quote === '"' && text[i] === '\\') {
      i += 1;
      continue;
    }
    if (text[i] === quote) return i;
  }
  return -1;
}

function stripInlineComment(raw: string): string {
  const hash = raw.search(/\s#/);
  return (hash === -1 ? raw : raw.slice(0, hash)).trim();
}
