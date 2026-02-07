---
sidebar_position: 2
title: Interactive Mode
---

# Interactive Mode (REPL)

Run `synapsync` without arguments to enter interactive mode.

## Starting REPL

```bash
synapsync
```

```
 ███████╗██╗   ██╗███╗   ██╗ █████╗ ██████╗ ███████╗
 ██╔════╝╚██╗ ██╔╝████╗  ██║██╔══██╗██╔══██╗██╔════╝
 ███████╗ ╚████╔╝ ██╔██╗ ██║███████║██████╔╝███████╗
 ╚════██║  ╚██╔╝  ██║╚██╗██║██╔══██║██╔═══╝ ╚════██║
 ███████║   ██║   ██║ ╚████║██║  ██║██║     ███████║
 ╚══════╝   ╚═╝   ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚══════╝

 Neural AI Orchestration Platform v0.1.0

synapsync >
```

## Commands

All commands are prefixed with `/`:

| Command | Description |
|---------|-------------|
| `/help [command]` | Show available commands or help for a specific command |
| `/info` | Show SynapSync concepts |
| `/init` | Initialize a new project |
| `/config` | Show/set configuration |
| `/status` | Show project status |
| `/providers` | Manage AI providers |
| `/add <name>` | Add a cognitive |
| `/list` | List installed cognitives |
| `/list --remote` | Browse registry |
| `/uninstall <name>` | Remove a cognitive |
| `/sync` | Sync to providers |
| `/update` | Update cognitives |
| `/doctor` | Diagnose project issues |
| `/clean` | Clean orphaned files |
| `/purge` | Remove SynapSync from project |
| `/version` | Show version info |
| `/clear` | Clear screen |
| `/exit` | Exit REPL |

## Examples

### Browse and Install

```
synapsync > /list --remote

Registry Cognitives
───────────────────
  code-reviewer     skill    general
  react-patterns    skill    frontend
  api-designer      skill    backend

synapsync > /add react-patterns

✓ Installed react-patterns v2.1.0
✓ Synced to claude
```

### Quick Status Check

```
synapsync > /status

Project Status
──────────────
Cognitives: 5 installed
Providers:  claude (enabled)

synapsync > /list

Skills (3)
  code-reviewer
  react-patterns
  api-designer
```

### Sync After Changes

```
synapsync > /sync

✓ Synced 5 cognitives to 1 provider
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate command history |
| `Tab` | Auto-complete commands |
| `Ctrl+C` | Cancel current input |
| `Ctrl+D` | Exit REPL |

## Command Options

REPL commands support the same options as CLI commands:

```
synapsync > /add code-reviewer --force
synapsync > /list --type skill --json
synapsync > /sync --dry-run
```

## Session History

Commands are saved in session history. Use arrow keys to navigate previous commands.

## Notes

- REPL maintains state between commands
- Faster than running separate CLI commands
- Great for exploration and quick tasks
- Exit with `/exit` or `Ctrl+D`
