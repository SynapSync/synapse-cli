---
sidebar_position: 3
title: Synchronization
---

# Synchronization

Sync is the process of making cognitives available to AI providers via symlinks.

## How It Works

```
┌──────────────────┐         ┌──────────────────┐
│   .synapsync/    │         │   .claude/       │
│   (source)       │ ──────▶ │   (symlinks)     │
│                  │  sync   │                  │
│   skills/        │         │   skills/        │
│   agents/        │         │   agents/        │
└──────────────────┘         └──────────────────┘
                    creates
                    symlinks
```

## Two-Phase Process

### Phase 1: Manifest Reconciliation

Compares filesystem with `manifest.json`:

1. Scans `.synapsync/` for cognitive files
2. Detects new, modified, or deleted cognitives
3. Updates `manifest.json` accordingly

```bash
synapsync sync
# Phase 1: Scanned 5 cognitives, added 1 new
```

### Phase 2: Provider Sync

Creates symlinks in provider directories:

1. Reads enabled providers from config
2. Creates directory structure if needed
3. Creates symlinks from provider dir to `.synapsync/`

```bash
# Phase 2: Created 2 symlinks in .claude/
```

## Symlink Types

Different cognitive types use different sync modes:

### Folder Sync (Skills)

Skills sync as folder symlinks to preserve assets:

```
.claude/skills/code-reviewer/
    └── → ../../.synapsync/skills/general/code-reviewer/
```

The entire folder is symlinked, including:
- `SKILL.md`
- `assets/` directory
- Any other files

### File Sync (Others)

Agents, prompts, workflows, and tools sync as file symlinks:

```
.claude/agents/feature-branch-manager.md
    └── → ../../.synapsync/agents/general/feature-branch-manager/AGENT.md
```

## Sync Commands

### Full Sync

```bash
synapsync sync
```

### Preview Changes

```bash
synapsync sync --dry-run
```

### Sync Specific Type

```bash
synapsync sync --type skill
```

### Sync to Specific Provider

```bash
synapsync sync --provider claude
```

### Check Status

```bash
synapsync sync status
```

## Copy Mode

For environments where symlinks don't work:

```bash
synapsync sync --copy
```

Creates file copies instead of symlinks. Downsides:
- Changes in `.synapsync/` don't auto-reflect
- Need to re-sync after edits

## Best Practices

1. **Sync happens automatically** when adding cognitives with `synapsync add`

2. **Check status regularly**
   ```bash
   synapsync sync status
   ```

3. **Clean orphans after uninstall**
   ```bash
   synapsync clean --orphans
   ```

4. **Dry-run before force sync**
   ```bash
   synapsync sync --dry-run
   synapsync sync --force
   ```
