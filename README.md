# Systemix

**Systemix** is a modular, high-performance toolkit designed for building secure and scalable JavaScript and TypeScript systems. It provides a suite of lightweight, cryptographically secure utilities and shared configurations to streamline modern web development.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Turbo](https://img.shields.io/badge/built%20with-turbo-000000.svg)](https://turbo.build/)

---

## 🚀 Vision

In an era where security and performance are paramount, **Systemix** aims to provide developers with a "standard library" of tools that are:

- **Modular**: Only use what you need.
- **Secure**: Built on top of robust cryptographic primitives.
- **Scalable**: Designed for both small projects and large-scale monorepos.
- **Developer-First**: Comprehensive types, flat configurations, and seamless DX.

---

## 📦 Packages

Systemix is organized as a monorepo, housing specialized packages for different needs:

| Package                                       | Version | Description                                                            |
| :-------------------------------------------- | :------ | :--------------------------------------------------------------------- |
| [`@systemix/password`](packages/password)     | `0.0.2` | Secure password generator with character guarantees and entropy tools. |
| [`@systemix/passphrase`](packages/passphrase) | `0.0.2` | Human-readable passphrase generator with formatting and entropy tools. |

### 🛠 Shared Configs

We also provide standardized configurations to maintain high code quality across projects:

- **`@systemix/eslint`**: Modern ESLint v10 flat configurations for JS, TS, React, and Next.js.
- **`@systemix/typescript`**: Base TS configurations for various environments.

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
