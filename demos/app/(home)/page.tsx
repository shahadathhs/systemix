import {
  createKeyring,
  generateKeyBytes,
  type Keyring,
} from '@systemix/cipher';
import { hashPassword, needsRehash, verifyPassword } from '@systemix/hash';
import { createMonotonicUuidV7, uuidV7Timestamp } from '@systemix/id';
import { createRateLimiter } from '@systemix/rate-limit';
import { encodeSigned, verifySigned } from '@systemix/token/signed';
import { randomBytes } from 'node:crypto';
import Link from 'next/link';
import { CodeWindow } from '@/components/CodeWindow';
import { GithubIcon } from '@/components/brand-icons';
import { Reveal } from '@/components/Reveal';

const RELEASES = 'https://github.com/shahadathhs/systemix/releases';

const stats = [
  { value: '8', label: 'libraries' },
  { value: '0', label: 'dependencies in them' },
  { value: '458', label: 'tests passing' },
  { value: '24.7+', label: 'Node.js only' },
];

const why = [
  {
    title: 'Nothing to audit but us',
    body: 'The eight libraries have an empty dependencies list. Everything runs on node:crypto and the standard library, so there is no transitive tree to track CVEs in.',
  },
  {
    title: 'Defaults match OWASP',
    body: 'Argon2id at 19 MiB, 2 passes, 1 lane. AES-256-GCM with a fresh random IV per message. You get the recommended setting without choosing it.',
  },
  {
    title: 'Old data keeps working',
    body: 'Hashes and ciphertexts from earlier versions still verify and decrypt. needsRehash and needsRotation tell you which ones to upgrade at your own pace.',
  },
  {
    title: 'Checked against references',
    body: 'Tests use the RFC 7515 JWS vector, the Argon2id reference vector, and attack tokens built outside the library. 458 tests across the packages.',
  },
];

const fixes = [
  {
    pkg: 'rate-limit',
    title: 'Blocked clients got a fresh allowance',
    body: 'The cleanup pass deleted token buckets that were empty, so a client that had hit its limit was let back in at the next sweep.',
  },
  {
    pkg: 'token',
    title: 'An RSA public key could sign HS256 tokens',
    body: 'Verification accepted the public key as an HMAC secret, so anyone who had it could forge a token. Keys and algorithms are now checked against each other.',
  },
  {
    pkg: 'env',
    title: 'A .env file overrode the real environment',
    body: 'A value in a file beat a variable you had actually set. The real environment now wins.',
  },
  {
    pkg: 'passphrase',
    title: 'The default word list had 10 words',
    body: 'Four words from it is about 13 bits of entropy. The default is now the EFF list, about 51.7 bits for four words.',
  },
];

const packages = [
  ['env', 'Typed .env loading. The real environment wins over files.'],
  ['password', 'Random passwords with bias-free sampling.'],
  ['passphrase', 'Passphrases from the 7,776-word EFF list.'],
  ['token', 'Random tokens, and JWS signing: HS, RS, PS, ES, EdDSA.'],
  ['hash', 'Argon2id, PHC strings, needsRehash.'],
  ['cipher', 'AES-256-GCM, versioned envelope, key rotation.'],
  ['id', 'UUIDv7, ULID and nanoid-style IDs.'],
  ['rate-limit', 'Fixed window, sliding window and token bucket.'],
] as const;

const tooling = [
  ['eslint', 'Flat configs for JS, TS, Express and Next.js.'],
  ['typescript', 'Base tsconfig presets, bundler and nodenext.'],
  ['runner', 'The small test runner every package uses.'],
] as const;

const demos = [
  ['Env Loader', '/env', 'Load and validate, with a strict-mode error.'],
  ['Password', '/password', 'Generate and score passwords.'],
  ['Passphrase', '/passphrase', 'EFF words, with an entropy readout.'],
  ['Token', '/token', 'Sign and verify, HS to EdDSA.'],
  ['Hash', '/hash', 'Argon2id, verify, needsRehash.'],
  ['Cipher', '/cipher', 'Keyring, rotation, envelope inspector.'],
  ['ID', '/id', 'UUIDv7, ULID, nanoid, decoded.'],
  ['Rate Limit', '/rate-limit', 'Watch a limiter fill and refuse.'],
] as const;

const errorText = (e: unknown) =>
  e instanceof Error ? `${e.name}: ${e.message}` : String(e);

async function attempt(run: () => Promise<unknown>) {
  try {
    return `accepted (${String(await run())})`;
  } catch (e) {
    return errorText(e);
  }
}

type Example = {
  pkg: string;
  title: string;
  body: string;
  file: string;
  code: string;
  output: ReadonlyArray<readonly [label: string, value: string]>;
};

/**
 * Every value below comes from running the packages when the site is built,
 * so the output next to each snippet is real, never typed in by hand.
 */
async function examples(): Promise<Example[]> {
  // hash
  const password = 'correct horse battery staple';
  const stored = await hashPassword(password);
  const scryptHash = await hashPassword(password, { algorithm: 'scrypt' });

  // cipher
  const k1 = generateKeyBytes();
  const k2 = generateKeyBytes();
  const ring: Keyring = createKeyring({ keys: { k1 }, current: 'k1' });
  const sealed = await ring.encryptString('card ending 4242');
  const next = createKeyring({ keys: { k1, k2 }, current: 'k2' });
  const flip = sealed[sealed.length - 3] === 'A' ? 'B' : 'A';
  const tampered = sealed.slice(0, -3) + flip + sealed.slice(-2);

  // token
  const secret = randomBytes(32).toString('base64url');
  const token = await encodeSigned({ sub: 'user_1' }, secret, {
    algorithm: 'HS256',
    expiresIn: 900,
  });
  const [header, , signature] = token.split('.');
  const swapped = Buffer.from('{"sub":"admin"}').toString('base64url');
  const forged = `${header}.${swapped}.${signature}`;
  const verified = await verifySigned(token, secret, {
    algorithms: ['HS256'],
  });

  // rate-limit
  const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
  const calls: string[] = [];
  for (let i = 0; i < 4; i++) {
    const r = await limiter.limit('203.0.113.7');
    calls.push(
      r.success
        ? `allowed, ${r.remaining} left`
        : `blocked, retry in ${Math.ceil(r.retryAfter / 1000)}s`,
    );
  }

  // id
  const nextId = createMonotonicUuidV7();
  const ids = [nextId(), nextId(), nextId()];
  const inOrder = [...ids].sort().join() === ids.join();
  const stamp = new Date(uuidV7Timestamp(ids[0]!)).toISOString();

  return [
    {
      pkg: 'hash',
      title: 'Argon2id, in one column',
      body: 'The default is Argon2id at the OWASP minimum. The result is a single PHC string with the algorithm, parameters and salt, so you store one value and can raise the cost later.',
      file: 'login.ts',
      code: `const stored = await hashPassword(password);

await verifyPassword(password, stored);
await verifyPassword('wrong guess', stored);

needsRehash(stored);
needsRehash(scryptHash);`,
      output: [
        ['stored', stored],
        ['right password', String(await verifyPassword(password, stored))],
        ['wrong password', String(await verifyPassword('wrong guess', stored))],
        ['needsRehash(stored)', String(needsRehash(stored))],
        ['needsRehash(scrypt)', String(needsRehash(scryptHash))],
      ],
    },
    {
      pkg: 'cipher',
      title: 'Rotate keys without a migration',
      body: 'Each payload carries the id of the key that made it, and that header is authenticated. Add a new current key and old payloads still decrypt.',
      file: 'rotate.ts',
      code: `const ring = createKeyring({ keys: { k1 }, current: 'k1' });
const sealed = await ring.encryptString('card ending 4242');

const next = createKeyring({ keys: { k1, k2 }, current: 'k2' });

next.needsRotation(sealed);
await next.decryptString(sealed);
await next.decryptString(tampered); // one character changed`,
      output: [
        ['sealed', sealed],
        ['needsRotation', String(next.needsRotation(sealed))],
        ['decryptString(sealed)', await next.decryptString(sealed)],
        [
          'decryptString(tampered)',
          await attempt(() => next.decryptString(tampered)),
        ],
      ],
    },
    {
      pkg: 'token',
      title: 'Refuses what it should refuse',
      body: 'You pick the accepted algorithm; the token never gets to. Short HMAC secrets are rejected, and a swapped payload does not verify.',
      file: 'sign.ts',
      code: `const token = await encodeSigned({ sub: 'user_1' }, secret, {
  algorithm: 'HS256',
  expiresIn: 900,
});

await verifySigned(token, secret, { algorithms: ['HS256'] });

// payload swapped, old signature kept
await verifySigned(forged, secret, { algorithms: ['HS256'] });

await encodeSigned({ sub: 'x' }, 'short', { algorithm: 'HS256' });`,
      output: [
        ['token', token],
        ['verify', `payload.sub = ${String(verified.sub)}`],
        [
          'verify(forged)',
          await attempt(() =>
            verifySigned(forged, secret, { algorithms: ['HS256'] }),
          ),
        ],
        [
          'weak secret',
          await attempt(() =>
            encodeSigned({ sub: 'x' }, 'short', { algorithm: 'HS256' }),
          ),
        ],
      ],
    },
    {
      pkg: 'rate-limit',
      title: 'One call per request',
      body: 'Fixed window, sliding window or token bucket behind the same async call. Stores are atomic, so a shared store cannot be raced into extra requests.',
      file: 'limit.ts',
      code: `const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });

for (let i = 1; i <= 4; i++) {
  const r = await limiter.limit('203.0.113.7');
  // r.success, r.remaining, r.retryAfter
}`,
      output: calls.map((line, i) => [`call ${i + 1}`, line] as const),
    },
    {
      pkg: 'id',
      title: 'Time-ordered IDs that stay ordered',
      body: 'UUIDv7 sorts by creation time, which keeps database indexes tight. The monotonic generator keeps IDs from one millisecond in order.',
      file: 'ids.ts',
      code: `const next = createMonotonicUuidV7();
const ids = [next(), next(), next()];

uuidV7Timestamp(ids[0]);`,
      output: [
        ['ids', ids.join('\n')],
        ['sorted as created', String(inOrder)],
        ['timestamp', stamp],
      ],
    },
  ];
}

/** The day this page was built; the output on it is from that build. */
const buildDate = () => new Date().toISOString().slice(0, 10);

const textLink =
  'text-ink underline underline-offset-4 decoration-line-strong hover:decoration-ink';

export default async function Home() {
  const list = await examples();
  const builtOn = buildDate();
  const calls = list.reduce((n, ex) => n + ex.output.length, 0);

  return (
    <div className="flex-1">
      {/* Hero */}
      <section className="px-6 sm:px-10 pt-20 sm:pt-24 pb-20 border-b border-line">
        <div className="max-w-5xl mx-auto grid gap-12 lg:grid-cols-2 lg:gap-12 items-center">
          <div>
            <Reveal>
              <h1 className="font-display text-4xl sm:text-5xl xl:text-[56px] leading-[1.04] text-ink">
                Security packages for Node.js that depend on nothing.
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-6 text-lg text-muted leading-relaxed max-w-lg">
                Password hashing, encryption, signed tokens, IDs, env loading
                and rate limiting. Each is its own package, built on{' '}
                <code className="font-mono text-[15px] text-ink">
                  node:crypto
                </code>{' '}
                and nothing else.
              </p>
            </Reveal>

            <Reveal delay={160}>
              <div className="mt-8 max-w-sm border border-line-strong bg-raised px-4 py-3 font-mono text-sm text-ink">
                <span className="text-faint select-none">$ </span>
                pnpm add @systemix/hash
              </div>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-6 flex items-center gap-6 text-[15px]">
                <Link href="/docs" className={`font-medium ${textLink}`}>
                  Read the docs
                </Link>
                <a
                  href="https://github.com/shahadathhs/systemix"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-muted hover:text-ink"
                >
                  <GithubIcon className="size-4" />
                  Source on GitHub
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} y={32} className="min-w-0">
            <p className="text-xs text-faint mb-2">
              Output of {calls} real calls, run when the site was built (
              {builtOn}).
            </p>
            <dl className="border border-line bg-raised divide-y divide-line">
              {list
                .filter((ex) => ex.pkg !== 'rate-limit')
                .map((ex) => (
                  <div key={ex.pkg} className="px-4 py-3">
                    <dt className="font-mono text-[11px] text-faint">
                      @systemix/{ex.pkg}
                    </dt>
                    <dd className="mt-1 font-mono text-xs text-ink break-all leading-relaxed">
                      {ex.output[0]![1].split('\n')[0]}
                    </dd>
                  </div>
                ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-line">
        <div className="ruled-grid grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 90} className="h-full">
              <div className="ruled-cell text-center py-9 !bg-raised h-full">
                <div className="font-display text-4xl sm:text-5xl text-ink">
                  {stat.value}
                </div>
                <div className="hud mt-2">{stat.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Why */}
      <section className="px-6 sm:px-10 py-20 border-b border-line">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl text-ink">
              Why Systemix
            </h2>
          </Reveal>
          <div className="ruled-grid grid-cols-1 md:grid-cols-2 mt-8">
            {why.map((item, i) => (
              <Reveal key={item.title} delay={i * 90} className="h-full">
                <div className="ruled-cell h-full">
                  <span className="hud">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-display text-lg text-ink mt-2">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="px-6 sm:px-10 py-20 border-b border-line">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl text-ink">
              What the code does
            </h2>
            <p className="mt-3 text-muted max-w-lg leading-relaxed">
              Five packages, run for real. The output beside each snippet is
              what the code returned when this page was built.
            </p>
          </Reveal>

          <div className="mt-10">
            {list.map((ex) => (
              <Reveal key={ex.pkg} y={32}>
                <article className="grid gap-8 py-10 border-t border-line lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
                  <div>
                    <div className="font-mono text-xs text-faint">
                      @systemix/{ex.pkg}
                    </div>
                    <h3 className="mt-1.5 font-display text-[22px] text-ink leading-tight">
                      {ex.title}
                    </h3>
                    <p className="mt-3 text-[15px] text-muted leading-relaxed">
                      {ex.body}
                    </p>
                    <div className="mt-4 flex gap-5 text-[13px]">
                      <Link href={`/docs/${ex.pkg}`} className={textLink}>
                        Docs
                      </Link>
                      <Link href={`/${ex.pkg}`} className={textLink}>
                        Try it live
                      </Link>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-2.5">
                    <CodeWindow filename={ex.file} code={ex.code} />
                    <dl className="border border-line bg-raised divide-y divide-line">
                      {ex.output.map(([label, value]) => (
                        <div
                          key={label}
                          className="grid gap-1 px-3.5 py-2.5 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-3"
                        >
                          <dt className="font-mono text-[11px] text-faint pt-0.5">
                            {label}
                          </dt>
                          <dd className="font-mono text-[11.5px] text-ink break-all whitespace-pre-wrap leading-relaxed">
                            {value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Fixed defects */}
      <section className="px-6 sm:px-10 py-20 border-b border-line">
        <div className="max-w-5xl mx-auto grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          <Reveal className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="font-display text-3xl sm:text-4xl text-ink">
              Bugs we shipped, and fixed
            </h2>
            <p className="mt-3.5 text-[15px] text-muted leading-relaxed">
              Before the last release we audited our own packages. These are
              real defects from the earlier versions, each now covered by a
              regression test.{' '}
              <a
                href={RELEASES}
                target="_blank"
                rel="noreferrer"
                className={textLink}
              >
                Release notes
              </a>
              .
            </p>
          </Reveal>
          <ul className="divide-y divide-line border-y border-line">
            {fixes.map((fix, i) => (
              <li key={fix.title} className="py-5">
                <Reveal delay={i * 90}>
                  <div className="font-mono text-[11px] text-faint">
                    @systemix/{fix.pkg}
                  </div>
                  <h3 className="mt-1 text-lg font-medium text-ink">
                    {fix.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] text-muted leading-relaxed">
                    {fix.body}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Packages */}
      <section className="px-6 sm:px-10 py-20 border-b border-line">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl text-ink">
              Packages
            </h2>
          </Reveal>
          <div className="ruled-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {packages.map(([name, description], i) => (
              <Reveal key={name} delay={(i % 4) * 80} className="h-full">
                <Link
                  href={`/docs/${name}`}
                  className="ruled-cell block h-full"
                >
                  <span className="hud">{String(i + 1).padStart(2, '0')}</span>
                  <div className="font-mono text-[13px] font-medium text-ink mt-2.5">
                    {name}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {description}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Tooling */}
      <section className="px-6 sm:px-10 py-20 border-b border-line">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl text-ink">
              Tooling
            </h2>
            <p className="mt-2 text-sm text-muted">
              The configs this repo is built with.
            </p>
          </Reveal>
          <div className="ruled-grid grid-cols-1 md:grid-cols-3 mt-8">
            {tooling.map(([name, description], i) => (
              <Reveal key={name} delay={i * 90} className="h-full">
                <Link
                  href={`/docs/${name}`}
                  className="ruled-cell block h-full"
                >
                  <div className="font-mono text-[13px] font-medium text-ink">
                    @systemix/{name}
                  </div>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-muted">
                    {description}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Demos */}
      <section className="px-6 sm:px-10 py-20 border-b border-line">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="font-display text-3xl sm:text-4xl text-ink">
              Live demos
            </h2>
            <p className="mt-2 text-sm text-muted">
              Every demo runs the real package.
            </p>
          </Reveal>
          <div className="ruled-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mt-8">
            {demos.map(([label, href, description], i) => (
              <Reveal key={href} delay={(i % 4) * 70} className="h-full">
                <Link href={href} className="ruled-cell block h-full">
                  <span className="text-sm font-medium text-ink">
                    {label} →
                  </span>
                  <span className="block mt-1 text-[13px] text-muted">
                    {description}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Install */}
      <section className="px-6 sm:px-10 py-20 text-center">
        <Reveal className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl text-ink">
            Install one, or all of them.
          </h2>
          <div className="mt-6 mx-auto max-w-lg border border-line-strong bg-raised px-4 py-3 text-left font-mono text-sm text-ink break-words">
            <span className="text-faint select-none">$ </span>
            pnpm add @systemix/hash @systemix/cipher @systemix/token
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 text-[15px]">
            <Link href="/docs" className={`font-medium ${textLink}`}>
              Read the docs
            </Link>
            <a
              href="https://github.com/shahadathhs/systemix"
              target="_blank"
              rel="noreferrer"
              className="text-muted hover:text-ink"
            >
              Source on GitHub
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
