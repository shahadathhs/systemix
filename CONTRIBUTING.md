# Contributing to Systemix

Thank you for your interest in contributing to Systemix! This project is a modular, open-source toolkit for secure and scalable JavaScript systems, built with Node.js, TypeScript, and TurboRepo.

## Development Environment Setup

### Prerequisites

- **Node.js**: v24.x or higher
- **PNPM**: v10.x or higher
- **Make**: For running orchestration commands

### Initial Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Verify build:
   ```bash
   make build
   ```

## Development Workflow

We use **TurboRepo** and **pnpm** to manage the monorepo.

### Package Management

Our `Makefile` provides dynamic targets for all packages and configurations:

- **Build everything**: `make build`
- **Build a specific package**: `make build-<package-name>` (e.g., `make build-password`)
- **Lint all**: `make lint`
- **Lint a specific package**: `make lint-<package-name>`
- **Format all**: `make format`
- **Format a specific package**: `make format-<package-name>`

### Adding new packages

Simply add a new directory in `packages/` or `configs/` and the `Makefile` will automatically pick it up for the dynamic targets.

## Commit Message Guidelines

We use **Conventional Commits**. This is crucial because our CI/CD pipeline uses these messages to automate versioning and selective releases to NPM.

Format: `<type>(<scope>): <subject>`

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Formatting changes
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration
- `chore`: Other changes that don't modify src or test files

**Example:**
`feat(password): add custom character set support`

## Pull Request Process

1. Create a new branch from `main`.
2. Ensure your code passes all checks:
   ```bash
   make build
   make lint
   pnpm typecheck
   ```
3. Open a Pull Request using the provided PR template.
4. Once approved and merged into `main`, the CI/CD pipeline will automatically handle the NPM publication of updated packages.

## License

By contributing to Systemix, you agree that your contributions will be licensed under its MIT License.
