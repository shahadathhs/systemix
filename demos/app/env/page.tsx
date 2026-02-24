import { load } from '@systemix/env';
import Link from 'next/link';

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
    <div className="max-w-4xl mx-auto">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
            Env Loader
          </h1>
          <p className="text-muted-foreground">
            Typed environment variable loading and validation. Zero
            dependencies.
          </p>
        </div>

        <div className="glass rounded-2xl p-8 space-y-6">
          <h2 className="text-lg font-semibold text-white">
            Example: load(schema, source)
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">
                Schema
              </h3>
              <pre className="text-xs font-mono text-slate-300 bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
                {JSON.stringify(schema, null, 2)}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400 mb-2">
                Source (raw env)
              </h3>
              <pre className="text-xs font-mono text-slate-300 bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
                {JSON.stringify(source, null, 2)}
              </pre>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-2">
              Result (typed, parsed)
            </h3>
            <pre className="text-xs font-mono text-slate-300 bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
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
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-medium text-slate-400 mb-2">
              toSafeLog() — secrets masked
            </h3>
            <pre className="text-xs font-mono text-cyan-400 bg-slate-900/50 rounded-lg p-4 overflow-x-auto">
              {JSON.stringify(safe, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/docs/env"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium transition-all"
          >
            Read full docs
          </Link>
        </div>
      </div>
    </div>
  );
}
