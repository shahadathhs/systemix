# Contributing to Vortex

Thank you for your interest in contributing to Vortex! This project is a microservices ecosystem built with Node.js, TypeScript, and TurboRepo.

## Development Environment Setup

### Prerequisites

- **Node.js**: v24.x or higher
- **PNPM**: v10.x or higher
- **Docker & Docker Compose**: For running infrastructure services
- **Make**: For running orchestration commands

### Initial Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start infrastructure (MongoDB, RabbitMQ):
   ```bash
   make infra
   ```

## Development Workflow

We use **TurboRepo** to manage the monorepo.

### Running Services

- Run all services in dev mode: `pnpm dev`
- Run a specific service: `pnpm --filter <service-name> dev`

### Building

- Build all: `pnpm build`
- Build specific service: `pnpm --filter <service-name>... build` (The `...` ensures dependencies are built too)

### Code Quality

- Lint: `pnpm lint`
- Format: `pnpm format`
- Typecheck: `pnpm typecheck`

## Commit Message Guidelines

We use **Conventional Commits**. This is crucial because our CI/CD pipeline uses these messages to automate versioning and releases.

Format: `<type>(<scope>): <subject>`

**Types:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `build`: Changes that affect the build system or external dependencies
- `ci`: Changes to our CI configuration files and scripts
- `chore`: Other changes that don't modify src or test files

**Example:**
`feat(auth): add google oauth2 support`

## Pull Request Process

1. Create a new branch from `main`.
2. Ensure your code passes all CI checks (`pnpm lint`, `pnpm typecheck`, `pnpm build`).
3. Open a Pull Request using the provided PR template.
4. Once approved and merged into `main`, the CI/CD pipeline will automatically handle the release.

## Tools

You can use `make tools` to start management interfaces like **Mongo Express**.
