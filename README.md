```text
███████╗██╗   ██╗███╗   ██╗ █████╗ ██████╗ ███████╗██╗   ██╗███╗   ██╗ ██████╗
██╔════╝╚██╗ ██╔╝████╗  ██║██╔══██╗██╔══██╗██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝
███████╗ ╚████╔╝ ██╔██╗ ██║███████║██████╔╝███████╗ ╚████╔╝ ██╔██╗ ██║██║     
╚════██║  ╚██╔╝  ██║╚██╗██║██╔══██║██╔═══╝ ╚════██║  ╚██╔╝  ██║╚██╗██║██║     
███████║   ██║   ██║ ╚████║██║  ██║██║     ███████║   ██║   ██║ ╚████║╚██████╗
╚══════╝   ╚═╝   ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝
```

# SynapSync CLI

Neural AI Orchestration Platform - Manage AI cognitives (skills, agents, prompts, tools) across multiple providers.

[![Node.js](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

SynapSync CLI allows you to manage and synchronize AI cognitives across different AI providers (Claude, OpenAI, Cursor, etc.). Define your skills, agents, and prompts once, and sync them to all your AI tools.

### Key Features

- **Multi-Provider Support**: Sync cognitives to Claude, OpenAI, Cursor, and more
- **Cognitive Types**: Manage skills, agents, prompts, workflows, and tools
- **Registry Integration**: Search and install cognitives from the public registry
- **Symlink-Based Sync**: Efficient synchronization using symlinks (with copy fallback)
- **GitHub Integration**: Install cognitives directly from GitHub repositories

## Installation

```bash
# Install globally
npm install -g @synapsync/cli

# Or use npx
npx @synapsync/cli
```

### Requirements

- Node.js >= 20.0.0
- npm or yarn

## Quick Start

```bash
# Initialize a new project
synapsync init

# Search for cognitives
synapsync search code review

# Install a cognitive
synapsync install code-reviewer

# List installed cognitives
synapsync list

# Sync to providers
synapsync sync
```

## Commands

### Project Setup

| Command                              | Description                        |
| ------------------------------------ | ---------------------------------- |
| `synapsync init`                     | Initialize a new SynapSync project |
| `synapsync status`                   | Show project status                |
| `synapsync config list`              | List all configuration             |
| `synapsync config get <key>`         | Get a configuration value          |
| `synapsync config set <key> <value>` | Set a configuration value          |

### Provider Management

| Command                                      | Description                         |
| -------------------------------------------- | ----------------------------------- |
| `synapsync providers`                        | List all providers and their status |
| `synapsync providers enable <provider>`      | Enable a provider                   |
| `synapsync providers disable <provider>`     | Disable a provider                  |
| `synapsync providers path <provider> <path>` | Set custom path for a provider      |

### Cognitive Management

| Command                        | Description                           |
| ------------------------------ | ------------------------------------- |
| `synapsync search [query]`     | Search for cognitives in the registry |
| `synapsync install <source>`   | Install a cognitive                   |
| `synapsync list`               | List installed cognitives             |
| `synapsync uninstall <name>`   | Uninstall a cognitive                 |
| `synapsync update [cognitive]` | Update cognitives to latest versions  |
| `synapsync update --all`       | Update all cognitives                 |

### Synchronization

| Command                            | Description                                 |
| ---------------------------------- | ------------------------------------------- |
| `synapsync sync`                   | Sync cognitives with manifest and providers |
| `synapsync sync --dry-run`         | Preview sync without applying changes       |
| `synapsync sync --provider <name>` | Sync only to a specific provider            |
| `synapsync sync status`            | Show current sync status                    |

### Maintenance

| Command                  | Description                    |
| ------------------------ | ------------------------------ |
| `synapsync doctor`       | Diagnose project issues        |
| `synapsync doctor --fix` | Auto-fix detected issues       |
| `synapsync clean`        | Clean cache and orphaned files |
| `synapsync clean --all`  | Clean everything               |

### Information

| Command                       | Description                      |
| ----------------------------- | -------------------------------- |
| `synapsync help [command]`    | Display help for a command       |
| `synapsync version`           | Show version information         |
| `synapsync version --check`   | Check for updates                |
| `synapsync info`              | Show SynapSync concepts          |
| `synapsync info --cognitives` | Learn about cognitive types      |
| `synapsync info --install`    | Learn about installation sources |
| `synapsync info --providers`  | Learn about supported providers  |

## Installation Sources

SynapSync supports multiple installation sources:

```bash
# From registry
synapsync install code-reviewer

# From local path
synapsync install ./my-cognitive

# From GitHub (shorthand)
synapsync install github:user/repo

# From GitHub with path
synapsync install github:user/repo/cognitives/skill

# From GitHub with branch
synapsync install github:user/repo#develop

# From GitHub URL
synapsync install https://github.com/user/repo
```

## Cognitive Types

| Type       | File            | Description                                |
| ---------- | --------------- | ------------------------------------------ |
| `skill`    | `SKILL.md`      | Reusable capabilities for specific tasks   |
| `agent`    | `AGENT.md`      | Autonomous entities with defined behaviors |
| `prompt`   | `PROMPT.md`     | Template prompts for common scenarios      |
| `workflow` | `WORKFLOW.yaml` | Multi-step orchestrated processes          |
| `tool`     | `TOOL.md`       | External integrations and utilities        |

## Project Structure

After running `synapsync init`, your project will have:

```
your-project/
├── .synapsync/
│   ├── skills/
│   │   └── {category}/
│   │       └── {name}/
│   │           └── SKILL.md
│   ├── agents/
│   ├── prompts/
│   ├── workflows/
│   ├── tools/
│   ├── cache/
│   └── manifest.json
├── synapsync.config.yaml
└── .gitignore (updated)
```

## Supported Providers

| Provider | Status       | Sync Path           |
| -------- | ------------ | ------------------- |
| Claude   | ✅ Supported | `.claude/commands/` |
| Cursor   | ✅ Supported | `.cursor/`          |
| OpenAI   | ✅ Supported | `.openai/`          |
| Gemini   | 🔜 Planned   | `.gemini/`          |
| Copilot  | 🔜 Planned   | `.github/copilot/`  |

## Configuration

Configuration is stored in `synapsync.config.yaml`:

```yaml
version: '1.0.0'

project:
  name: my-project
  description: My AI-enhanced project

providers:
  claude:
    enabled: true
    path: .claude/commands
  cursor:
    enabled: false
    path: .cursor
  openai:
    enabled: false
    path: .openai

storage:
  cognitivesDir: .synapsync
  cacheDir: .synapsync/cache
```

## Troubleshooting

### Common Issues

**Project not initialized**

```bash
# Error: No SynapSync project found
synapsync init
```

**Symlinks not working (Windows)**

```bash
# Use copy mode instead
synapsync sync --copy
```

**Broken symlinks after moving cognitives**

```bash
# Clean orphaned symlinks and re-sync
synapsync clean --orphans
synapsync sync
```

**Registry connection issues**

```bash
# Check connectivity
synapsync doctor

# Clear cache and retry
synapsync clean --cache
```

### Diagnostic Commands

```bash
# Run full diagnostics
synapsync doctor

# Auto-fix issues
synapsync doctor --fix

# Verbose output for debugging
synapsync --verbose <command>
```

## Development

```bash
# Clone the repository
git clone https://github.com/SynapSync/synapse-cli.git
cd synapse-cli

# Install dependencies
npm install

# Build
npm run build

# Run in development mode
npm run dev

# Run tests
npm test

# Lint
npm run lint
```

## License

MIT License - see [LICENSE](LICENSE) for details.

## Links

- [Documentation](https://synapsync.github.io/synapse-cli/)
- [Registry](https://registry.synapsync.dev)
- [GitHub](https://github.com/SynapSync/synapse-cli)
- [Issues](https://github.com/SynapSync/synapse-cli/issues)
