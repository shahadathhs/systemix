# Systemix

**Systemix** is a modular, high-performance toolkit for building secure and scalable JavaScript and TypeScript systems. It provides cryptographically secure password and passphrase generators, plus shareable ESLint and TypeScript configs — a lightweight "standard library" for modern Node.js and web projects.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turbo](https://img.shields.io/badge/built%20with-turbo-000000.svg)](https://turbo.build/)
[![Docs](https://img.shields.io/badge/docs-systemix.vercel.app-blue)](https://systemix.vercel.app)

### Packages

Published to **npm** and **GitHub Packages**:

[![@systemix/password](https://img.shields.io/npm/v/@systemix/password.svg)](https://www.npmjs.com/package/@systemix/password)
[![@systemix/passphrase](https://img.shields.io/npm/v/@systemix/passphrase.svg)](https://www.npmjs.com/package/@systemix/passphrase)
[![@systemix/eslint](https://img.shields.io/npm/v/@systemix/eslint.svg)](https://www.npmjs.com/package/@systemix/eslint)
[![@systemix/typescript](https://img.shields.io/npm/v/@systemix/typescript.svg)](https://www.npmjs.com/package/@systemix/typescript)

---

## ⚡ Quick Start

```bash
pnpm add @systemix/password @systemix/passphrase
```

```typescript
import { generatePassword } from '@systemix/password';
import { generatePassphrase } from '@systemix/passphrase';

// Secure random password
console.log(generatePassword({ length: 16, useSymbols: true }));
// → "Z#kM@4p*J!h2X&b7"

// Memorable passphrase
console.log(generatePassphrase({ wordCount: 4 }));
// → "apple orange banana kiwi"
```

[**Live demos** →](https://systemix.vercel.app)

---

## 📦 Packages

| Package                                                                                                   | Description                                                                              |
| :-------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| [`@systemix/password`](packages/password) · [npm](https://www.npmjs.com/package/@systemix/password)       | Cryptographically secure password generator with character guarantees and entropy tools. |
| [`@systemix/passphrase`](packages/passphrase) · [npm](https://www.npmjs.com/package/@systemix/passphrase) | Human-readable passphrase generator with formatting and entropy tools.                   |
| [`@systemix/eslint`](configs/eslint) · [npm](https://www.npmjs.com/package/@systemix/eslint)              | ESLint v10 flat configs for JS, TS, React, Express, and Next.js.                         |
| [`@systemix/typescript`](configs/typescript) · [npm](https://www.npmjs.com/package/@systemix/typescript)  | Base TypeScript configs for various environments.                                        |

### Installation

```bash
# Utilities (password generator, passphrase generator)
pnpm add @systemix/password @systemix/passphrase

# Configs (ESLint flat config, TypeScript tsconfig)
pnpm add -D @systemix/eslint @systemix/typescript
```

With npm:

```bash
npm install @systemix/password @systemix/passphrase
npm install -D @systemix/eslint @systemix/typescript
```

From GitHub Packages (add to `.npmrc`: `@shahadathhs:registry=https://npm.pkg.github.com`):

```bash
pnpm add @shahadathhs/password @shahadathhs/passphrase
pnpm add -D @shahadathhs/eslint @shahadathhs/typescript
```

> **Recommendation:** Use npm (`@systemix/*`) — no extra config.

---

## 🚀 Vision

In an era where security and performance are paramount, **Systemix** aims to provide developers with a "standard library" of tools that are:

- **Modular**: Only use what you need.
- **Secure**: Built on top of robust cryptographic primitives.
- **Scalable**: Designed for both small projects and large-scale monorepos.
- **Developer-First**: Comprehensive types, flat configurations, and seamless DX.

---

## ✨ Key Features

- **Standardized Linting**: Pre-configured ESLint rules matching modern best practices.
- **Cryptographic Security**: Utilities utilize Node.js `crypto` for high-entropy randomization.
- **Turbo-Powered**: Build and test workflows optimized with Turbo for maximum speed.
- **TypeScript Native**: Full type safety and intelligent IDE support out of the box.

---

## 🛠 Tech Stack

- **Monorepo Management**: [pnpm](https://pnpm.io/) Workspaces
- **Build System**: [Turbo](https://turbo.build/)
- **Bundling**: [tsup](https://tsup.io/) (Rollup/Esbuild power)
- **Code Quality**: [ESLint 10](https://eslint.org/), [Prettier](https://prettier.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🤝 Contributing

We welcome contributions! Whether it's reporting a bug, suggesting a feature, or submitting a pull request, your help is appreciated.

- **[Contributing Guide](CONTRIBUTING.md)** — Setup and workflow
- **[Code of Conduct](CODE_OF_CONDUCT.md)** — Community standards

1. Clone the repo: `git clone https://github.com/shahadathhs/systemix.git`
2. Install dependencies: `pnpm install`
3. Build the project: `pnpm build`
4. Run checks: `pnpm ci:check`

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/shahadathhs">@shahadathhs</a>
</p>
