# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-02-06

### Added

#### Testing Suite Expansion
- **41 new test files** covering commands, services, UI, and utilities
  - All 14 CLI commands now have dedicated unit tests
  - REPL modules: arg-parser, dispatcher, registry
  - UI modules: banner, colors, logo
  - Services: registry client, sync engine, symlink manager, detector, parser
  - Utilities: logger
- **Coverage increased from 31% to 80%** (515 tests across 33 files)

#### CI/CD Pipeline
- GitHub Actions workflow with 3 parallel jobs (lint, test, build)
- Test matrix for Node.js 20 and 22
- Coverage artifact upload on Node 22
- Format checking step added to CI

### Changed

#### REPL Refactoring
- Decomposed `src/ui/repl.ts` (688 lines) into 8 focused modules under `src/ui/repl/`
  - `types.ts` - CommandDef, FlagDef, ParsedArgs interfaces
  - `arg-parser.ts` - Declarative argument parser replacing duplicated parsing
  - `registry.ts` - Command registry and registration function
  - `help.ts` - Help system and /help command
  - `commands.ts` - All 17 command handler registrations
  - `dispatcher.ts` - Input parsing and command routing
  - `loop.ts` - Readline event loop
  - `index.ts` - Barrel with side-effect imports

#### Dependency Updates
- Upgraded vitest v2 → v4 (fixes 6 moderate security vulnerabilities via esbuild)
- Updated commander 12 → 14, @clack/prompts 0.11 → 1.0, ora 8 → 9
- Updated typescript 5.7 → 5.9, tsup 8.3 → 8.5, prettier 3.4 → 3.8
- Updated @types/node 22 → 25, yaml 2.6 → 2.8
- Updated @typescript-eslint/* 8.0 → 8.54, eslint-config-prettier 9 → 10

### Fixed
- Resolved `no-non-null-assertion` lint error in init.ts validator
- Fixed @clack/prompts v1 breaking change (value possibly undefined in validators)

## [0.4.0] - 2026-01-28

### Added

#### Testing Suite (Phase 2 - Week 8)
- **Unit tests for ManifestManager** (`tests/unit/services/manifest.test.ts`)
  - Load/save manifest
  - Cognitive CRUD operations
  - Reconciliation logic
  - Provider sync state

- **Unit tests for CognitiveScanner** (`tests/unit/services/scanner.test.ts`)
  - Filesystem scanning
  - Compare with manifest
  - Convert to manifest format
  - Count by type

- **Unit tests for SyncEngine** (`tests/unit/services/sync.test.ts`)
  - Type definitions
  - SyncResult structure
  - SyncOptions handling
  - SyncAction operations

- **Unit tests for ConfigManager** (`tests/unit/services/config.test.ts`)
  - Load/save config
  - Create with defaults
  - Get/set nested values
  - Static factory methods

- **Unit tests for maintenance services** (`tests/unit/services/maintenance.test.ts`)
  - UpdateChecker version comparison
  - DoctorService diagnostics
  - CleanerService cleanup

### Changed
- All 95 unit tests passing
- Test coverage for core services

## [0.3.0] - 2026-01-28

### Added

#### Maintenance Commands (Phase 2 - Week 7)
- **UpdateChecker service** (`src/services/maintenance/update-checker.ts`)
  - Check installed cognitives for available updates
  - Compare versions using semver
  - Query registry for latest versions

- **DoctorService** (`src/services/maintenance/doctor.ts`)
  - Run diagnostic checks on SynapSync projects
  - Auto-fix capability for fixable issues
  - Checks: node-version, synapsync-dir, config-valid, manifest-exists,
    manifest-consistency, providers-configured, symlinks validity, registry-connectivity

- **CleanerService** (`src/services/maintenance/cleaner.ts`)
  - Clean registry cache files
  - Remove orphaned symlinks
  - Delete temp files
  - Calculate freed disk space

- **`synapsync update` command**
  - `synapsync update [cognitive]` - Update specific cognitive
  - `--all` - Update all cognitives
  - `--force` - Force update even if already latest
  - `--dry-run` - Preview updates without applying
  - `--json` - JSON output

- **`synapsync doctor` command**
  - Run comprehensive diagnostics on project
  - `--fix` - Auto-fix detected issues
  - `--check <checks...>` - Run specific checks only
  - `--verbose` - Detailed output
  - `--json` - JSON output

- **`synapsync clean` command**
  - Clean cache, orphaned symlinks, and temp files
  - `--cache` - Clean registry cache only
  - `--orphans` - Clean orphaned symlinks only
  - `--temp` - Clean temp files only
  - `--all` - Clean everything
  - `--dry-run` - Preview what would be cleaned
  - `--json` - JSON output

### Changed
- Updated `src/cli.ts` to register update, doctor, and clean commands
- Updated `src/services/index.ts` to export maintenance services

## [0.2.0] - 2026-01-28

### Added

#### Sync Command (Phase 2 - Weeks 5-6)
- **ManifestManager service** (`src/services/manifest/`)
  - Read/write manifest.json
  - Reconcile filesystem with manifest
  - Track installed cognitives with metadata and hashes

- **CognitiveScanner service** (`src/services/scanner/`)
  - Scan `.synapsync/` directory for cognitives
  - Parse YAML frontmatter from cognitive files
  - Detect new, modified, and removed cognitives
  - Content hashing for change detection (SHA-256)

- **SyncEngine service** (`src/services/sync/`)
  - Phase 1: Filesystem ↔ manifest reconciliation
  - Phase 2: Manifest ↔ provider symlinks
  - Progress callbacks for UI feedback

- **SymlinkManager service** (`src/services/symlink/`)
  - Create symlinks from provider dirs to .synapsync
  - Fallback to file copy on Windows
  - Detect and remove orphaned symlinks
  - Verify symlink validity

- **`synapsync sync` command**
  - Double synchronization (manifest + providers)
  - `--dry-run` - Preview changes without applying
  - `--type <type>` - Filter by cognitive type
  - `--category <category>` - Filter by category
  - `--provider <provider>` - Sync to specific provider only
  - `--copy` - Use file copy instead of symlinks
  - `--force` - Force sync even if already synced
  - `--verbose` - Detailed output
  - `--json` - JSON output

- **`synapsync sync status` subcommand**
  - Show manifest vs filesystem sync status
  - Show provider symlink status (valid/broken/orphaned)

### Changed
- Updated `src/cli.ts` to register sync command
- Updated `src/services/index.ts` to export new services

## [0.1.0] - 2026-01-27

### Added

#### Phase 1 - Foundation (Weeks 1-4)

- **Project Setup**
  - TypeScript + Node.js 20+ configuration
  - tsup for building
  - Vitest for testing
  - ESLint + Prettier for code quality

- **CLI Framework**
  - Commander.js for command parsing
  - Interactive REPL mode with readline
  - Colored output with picocolors
  - Custom logger utility

- **Core Commands**
  - `synapsync help` - Show help information
  - `synapsync version` - Show CLI version
  - `synapsync info` - Explain SynapSync concepts
  - `synapsync init` - Initialize a project
  - `synapsync config` - View/set configuration
  - `synapsync status` - Show project status
  - `synapsync providers` - Manage AI providers

- **Cognitive Management**
  - `synapsync search` - Search registry for cognitives
  - `synapsync install` - Install cognitives from registry
  - `synapsync list` - List installed cognitives
  - `synapsync uninstall` - Remove installed cognitives

- **Configuration System**
  - YAML-based config (`synapsync.config.yaml`)
  - Provider configuration with paths
  - Storage and CLI settings

- **Registry Integration**
  - Connect to synapse-registry
  - Search by name, type, category
  - Download and install cognitives

### Technical Details

- Cognitive types: skill, agent, prompt, workflow, tool
- Provider support: claude, openai, gemini, cursor, windsurf, copilot
- Categories: frontend, backend, database, devops, security, testing, analytics, automation, general

---

[Unreleased]: https://github.com/SynapSync/synapse-cli/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/SynapSync/synapse-cli/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/SynapSync/synapse-cli/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/SynapSync/synapse-cli/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/SynapSync/synapse-cli/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/SynapSync/synapse-cli/releases/tag/v0.1.0
