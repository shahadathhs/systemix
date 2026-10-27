import { load, parseEnvFile } from '@systemix/env';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Everything here runs on the server at build time with fixed inputs.
const ENV_FILE = `# .env
NODE_ENV=development          # overridden by the real environment below
PORT=3000
DEBUG=on
API_KEY="sk-live-abc123secret"
GREETING="hello\\nworld"
URL=http://example.test/#anchor`;

const REAL_ENV = {
  NODE_ENV: 'production',
  PORT: '8080',
};

/** Really runs strict mode against a .env file that contains a typo. */
function runStrictDemo(): string {
  const dir = mkdtempSync(join(tmpdir(), 'systemix-env-demo-'));
  const file = join(dir, '.env');
  writeFileSync(file, 'PORT=3000\nDATABSE_URL=postgres://localhost/app\n');
  try {
    load(
      {
        PORT: { type: 'number' as const },
        DATABASE_URL: { type: 'string' as const },
      },
      { source: {}, fromFile: file, strict: true },
    );
    return 'no error';
  } catch (e) {
    return e instanceof Error ? e.message : String(e);
  }
}

export default function EnvPage() {
  const schema = {
    NODE_ENV: { type: 'string' as const, default: 'development' },
    PORT: { type: 'number' as const, default: 3000 },
    DEBUG: { type: 'boolean' as const, default: false },
    API_KEY: { type: 'string' as const, secret: true },
  };

  const parsed = parseEnvFile(ENV_FILE);
  // The file layer sits below the real environment: source wins.
  const env = load(schema, { source: { ...parsed, ...REAL_ENV } });

  const strictResult = runStrictDemo();

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Env Loader
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Typed environment loading and validation. This page runs{' '}
          <code className="font-mono text-[0.8125rem] bg-sunken border border-line rounded px-1 py-0.5">
            load(schema, &#123; source &#125;)
          </code>{' '}
          on the server at build time with fixed inputs. The real environment
          always wins over a{' '}
          <code className="font-mono text-[0.8125rem]">.env</code> file.
        </p>
      </div>

      <div className="panel p-6 space-y-6">
        <div>
          <div className="label mb-2">.env file</div>
          <div className="mono-box">{ENV_FILE}</div>
        </div>

        <div>
          <div className="label mb-2">
            parseEnvFile() — comments stripped, quotes and escapes handled
          </div>
          <div className="mono-box">{JSON.stringify(parsed, null, 2)}</div>
        </div>

        <div>
          <div className="label mb-2">
            Real environment (wins over the file)
          </div>
          <div className="mono-box">{JSON.stringify(REAL_ENV, null, 2)}</div>
        </div>

        <div>
          <div className="label mb-2">Schema</div>
          <div className="mono-box">{JSON.stringify(schema, null, 2)}</div>
        </div>

        <div>
          <div className="label mb-2">
            Result — NODE_ENV and PORT from the real env, the rest from the file
          </div>
          <div className="mono-box">
            {JSON.stringify(
              {
                NODE_ENV: env.NODE_ENV,
                PORT: env.PORT,
                DEBUG: env.DEBUG,
                API_KEY: env.API_KEY,
              },
              null,
              2,
            )}
          </div>
        </div>

        <div>
          <div className="label mb-2">
            JSON.stringify(env) — secret is not enumerable, so it never leaks
          </div>
          <div className="mono-box">{JSON.stringify(env)}</div>
        </div>

        <div>
          <div className="label mb-2">toSafeLog() — secrets masked</div>
          <div className="mono-box">
            {JSON.stringify(env.toSafeLog(), null, 2)}
          </div>
        </div>

        <div>
          <div className="label mb-2">
            strict: true — real output for a .env file containing DATABSE_URL
            (typo)
          </div>
          <div className="mono-box">{strictResult}</div>
        </div>
      </div>
    </div>
  );
}
