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
| `/help` | Show available commands |
| `/search [query]` | Search the registry |
| `/add <name>` | Add a cognitive |
| `/list` | List installed cognitives |
| `/list --remote` | Browse registry |
| `/uninstall <name>` | Remove a cognitive |
| `/sync` | Sync to providers |
| `/status` | Show project status |
| `/config` | Show configuration |
| `/providers` | List providers |
| `/clear` | Clear screen |
| `/exit` | Exit REPL |

## Examples

### Search and Install

```
synapsync > /search react

Search Results
──────────────
  react-patterns    skill    frontend
  react-testing     skill    testing

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
