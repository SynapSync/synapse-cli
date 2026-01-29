---
sidebar_position: 1
title: Commands Overview
---

# CLI Commands

Complete reference for all SynapSync CLI commands.

## Command Categories

### Project Setup
| Command | Description |
|---------|-------------|
| [`init`](/cli/commands/init) | Initialize a new project |
| [`config`](/cli/commands/config) | Manage configuration |
| [`status`](/cli/commands/status) | Show project status |

### Provider Management
| Command | Description |
|---------|-------------|
| [`providers`](/cli/commands/providers) | Manage AI providers |

### Cognitive Management
| Command | Description |
|---------|-------------|
| [`search`](/cli/commands/search) | Search the registry |
| [`add`](/cli/commands/add) | Add cognitives |
| [`list`](/cli/commands/list) | List installed cognitives |
| [`uninstall`](/cli/commands/uninstall) | Remove cognitives |
| [`update`](/cli/commands/update) | Update cognitives |

### Synchronization
| Command | Description |
|---------|-------------|
| [`sync`](/cli/commands/sync) | Sync to providers |

### Maintenance
| Command | Description |
|---------|-------------|
| [`doctor`](/cli/commands/doctor) | Diagnose issues |
| [`clean`](/cli/commands/clean) | Clean cache and orphans |
| [`purge`](/cli/commands/purge) | Completely remove SynapSync from the project |

### Information
| Command | Description |
|---------|-------------|
| [`help`](/cli/commands/help) | Show help |
| [`version`](/cli/commands/version) | Show version |
| [`info`](/cli/commands/info) | Show concepts |

## Global Options

Available on all commands:

```
-v, --version    Show CLI version
--verbose        Enable verbose output
--no-color       Disable colored output
-h, --help       Show help for command
```

## Common Patterns

### JSON Output

Most commands support `--json` for scripting:

```bash
synapsync list --json | jq '.[] | .name'
```

### Dry Run

Preview changes without applying:

```bash
synapsync sync --dry-run
synapsync clean --dry-run
synapsync update --dry-run
```

### Filtering

Filter by type or category:

```bash
synapsync list --type skill
synapsync search --category frontend
synapsync sync --type agent --provider claude
```
