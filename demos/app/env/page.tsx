import { load } from '@systemix/env';

export default function EnvPage() {
  const schema = {
    NODE_ENV: { type: 'string' as const, default: 'development' },
    PORT: { type: 'number' as const, default: 3000 },
    DEBUG: { type: 'boolean' as const, default: false },
    API_KEY: { type: 'string' as const, secret: true },
  };

  const source = {
    NODE_ENV: 'production',
    PORT: '8080',
    DEBUG: 'true',
    API_KEY: 'sk-live-abc123secret',
  };

  const env = load(schema, { source });
  const safe = env.toSafeLog();

  return (
    <div className="max-w-3xl mx-auto px-6 sm:px-10 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Env Loader
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Typed environment variable loading and validation. This example runs{' '}
          <code className="font-mono text-[0.8125rem] bg-sunken border border-line rounded px-1 py-0.5">
            load(schema, source)
          </code>{' '}
          at build time with a fixed source.
        </p>
      </div>

      <div className="panel p-6 space-y-6">
        <div>
          <div className="label mb-2">Schema</div>
          <div className="mono-box">{JSON.stringify(schema, null, 2)}</div>
        </div>

        <div>
          <div className="label mb-2">Source (raw env)</div>
          <div className="mono-box">{JSON.stringify(source, null, 2)}</div>
        </div>

        <div>
          <div className="label mb-2">Result (typed, parsed)</div>
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
          <div className="label mb-2">toSafeLog() — secrets masked</div>
          <div className="mono-box">{JSON.stringify(safe, null, 2)}</div>
        </div>
      </div>
    </div>
  );
}
