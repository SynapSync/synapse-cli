# Contributing to SynapSync CLI

Thank you for your interest in contributing to SynapSync CLI! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/synapse-cli.git`
3. Add upstream remote: `git remote add upstream https://github.com/SynapSync/synapse-cli.git`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

### Installation

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

### Project Structure

```
src/
├── cli.ts              # CLI entry point (Commander.js setup)
├── commands/           # Command implementations (add, init, sync, etc.)
├── services/           # Core business logic
│   ├── config/         # Configuration management
│   ├── registry/       # Registry client
│   ├── scanner/        # Cognitive file scanner
│   ├── symlink/        # Symlink management
│   ├── sync/           # Sync engine
│   ├── manifest/       # Manifest management
│   └── maintenance/    # Doctor, clean, update services
├── ui/                 # User interface
│   ├── repl/           # Interactive REPL (modular)
│   │   ├── arg-parser.ts   # Declarative argument parser
│   │   ├── commands.ts     # Command registrations
│   │   ├── dispatcher.ts   # Input routing
│   │   ├── help.ts         # Help system
│   │   ├── loop.ts         # Readline event loop
│   │   ├── registry.ts     # Command registry
│   │   └── types.ts        # REPL type definitions
│   ├── banner.ts       # Banner and messages
│   ├── colors.ts       # Color utilities
│   └── logo.ts         # ASCII logo
├── utils/              # Utility functions (logger)
├── core/               # Constants and core definitions
└── types/              # TypeScript type definitions
```

## Making Changes

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or fixes

### Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(cli): add new search filters
fix(sync): resolve symlink creation on Windows
docs(readme): update installation instructions
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure all tests pass: `npm test`
4. Ensure linter passes: `npm run lint`
5. Update CHANGELOG.md with your changes
6. Submit PR against the `main` branch

### PR Title Format

Follow the same convention as commit messages:
```
feat(scope): description
```

### PR Description

Include:
- Summary of changes
- Related issue numbers (if any)
- Testing steps
- Screenshots (for UI changes)

## Coding Standards

### TypeScript

- Use strict TypeScript (already configured)
- Avoid `any` types
- Use explicit return types for functions
- Prefer `interface` over `type` for object shapes

### Style

- Use ESLint and Prettier (configured)
- Run `npm run lint:fix` before committing
- Run `npm run format` for formatting

### File Organization

- One component/service per file
- Group related files in directories
- Use index.ts for public exports

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Writing Tests

- Place tests in `tests/` directory
- Mirror the `src/` structure
- Name test files: `*.test.ts`
- Use descriptive test names

Example:
```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do something specific', () => {
      // Test code
    });
  });
});
```

## Documentation

### Code Comments

- Add JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up to date

### README and Docs

- Update README.md for user-facing changes
- Update docs/ for architectural changes
- Add examples for new features

## Questions?

- Open a [GitHub Issue](https://github.com/SynapSync/synapse-cli/issues)
- Check existing issues and discussions

Thank you for contributing! 🎉
