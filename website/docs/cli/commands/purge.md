---
sidebar_position: 14
title: purge
---

# synapsync purge

Completely remove SynapSync from the project. Deletes all cognitives, provider synced content, configuration, and storage.

## Usage

```bash
synapsync purge [options]
```

## Options

| Option | Description |
|--------|-------------|
| `-f, --force` | Skip confirmation and remove everything |

## What Gets Removed

| Item | Path |
|------|------|
| Storage directory | `.synapsync/` |
| Configuration | `synapsync.config.yaml` |
| Provider content | `.claude/`, `.cursor/`, `.openai/`, etc. |
| Gitignore entries | SynapSync lines in `.gitignore` |

## Examples

### Preview (default)

```bash
synapsync purge
```

```
  ! This will completely remove SynapSync from your project:

    ✗ .claude/skills/
    ✗ .claude/agents/
    ✗ .synapsync/
    ✗ synapsync.config.yaml
    ✗ .gitignore (SynapSync entries)

  💡 Use --force to confirm and remove everything.
```

### Confirm and Remove

```bash
synapsync purge --force
```

```
  ✗ Removed .claude/skills/
  ✗ Removed .claude/agents/
  ✗ Removed .synapsync/
  ✗ Removed synapsync.config.yaml
  ✗ Cleaned SynapSync entries from .gitignore

  ✓ SynapSync has been completely removed from this project.
```

## Notes

- Without `--force`, the command shows a preview of what will be removed
- Provider directories are only removed if they become empty after cleanup
- The `.gitignore` file is preserved; only SynapSync-specific entries are removed
- This action is irreversible — all installed cognitives and configuration will be lost
