# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/SynapSync/synapse-cli/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/SynapSync/synapse-cli/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/SynapSync/synapse-cli/releases/tag/v0.1.0
