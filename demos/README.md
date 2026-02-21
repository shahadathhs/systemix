# Systemix Demos

Live documentation and interactive demos for [Systemix](https://github.com/shahadathhs/systemix) packages.

> **Note:** Demos use published npm packages (`@systemix/password`, `@systemix/passphrase`, `@systemix/token`), not workspace links. Update demos after publishing new package versions.

## Features

- **MDX Documentation** — Sidebar navigation and markdown-based docs at `/docs`
- **Interactive Demos** — Password, passphrase, and token generators with live configuration
- **Dark theme** — Consistent with the Systemix brand

## Getting Started

From the monorepo root:

```bash
pnpm dev
```

Or from this directory:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to explore.

## Routes

| Route              | Description                        |
| ------------------ | ---------------------------------- |
| `/`                | Home                               |
| `/docs`            | Documentation (MDX, sidebar)       |
| `/docs/password`   | @systemix/password API reference   |
| `/docs/passphrase` | @systemix/passphrase API reference |
| `/docs/token`      | @systemix/token API reference      |
| `/password`        | Password generator demo            |
| `/passphrase`      | Passphrase generator demo          |
| `/token`           | Token generator demo               |

## Scripts

| Script           | Description                  |
| ---------------- | ---------------------------- |
| `pnpm dev`       | Start the Next.js dev server |
| `pnpm build`     | Build for production         |
| `pnpm start`     | Start the production server  |
| `pnpm lint`      | Run ESLint                   |
| `pnpm typecheck` | Run TypeScript check         |

## Author

**Shahadath Hossen Sajib**

- GitHub: [@shahadathhs](https://github.com/shahadathhs)
- Email: shahadathhossensajib732@gmail.com

## License

MIT © [Shahadath Hossen Sajib](https://github.com/shahadathhs)
