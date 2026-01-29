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

| Item | Description |
|------|-------------|
| Symlinks to `.synapsync/` | Only symlinks in provider directories (`.claude/`, `.cursor/`, etc.) that point to `.synapsync/` |
| Storage directory | `.synapsync/` |
| Configuration | `synapsync.config.yaml` |
| Gitignore entries | SynapSync-specific lines in `.gitignore` |

> **Note:** Provider directories themselves (`.claude/`, `.cursor/`, `.openai/`, etc.) are **not** removed. Only symlinks created by SynapSync are cleaned up, preserving any content you added independently.

## Examples

### Preview (default)

```bash
synapsync purge
```

```
  ! This will completely remove SynapSync from your project:

    ✗ .claude/skills/code-reviewer.md (symlink)
    ✗ .cursor/skills/react-patterns.md (symlink)
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
  ✗ Removed symlink .claude/skills/code-reviewer.md
  ✗ Removed symlink .cursor/skills/react-patterns.md
  ✗ Removed .synapsync/
  ✗ Removed synapsync.config.yaml
  ✗ Cleaned SynapSync entries from .gitignore

  ✓ SynapSync has been completely removed from this project.
```

## Notes

- Without `--force`, the command shows a preview of what will be removed
- Only symlinks pointing to `.synapsync/` are removed — your own provider files are preserved
- The `.gitignore` file is preserved; only SynapSync-specific entries are removed
- This action is irreversible — all installed cognitives and configuration will be lost
