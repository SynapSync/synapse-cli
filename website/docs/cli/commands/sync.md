---
sidebar_position: 10
title: sync
---

# synapsync sync

Synchronize cognitives with manifest and provider directories.

## Usage

```bash
synapsync sync [options]
synapsync sync status
```

## Options

| Option | Description |
|--------|-------------|
| `-n, --dry-run` | Preview changes without applying |
| `-t, --type <type>` | Sync only this type |
| `-c, --category <cat>` | Sync only this category |
| `-p, --provider <prov>` | Sync to specific provider |
| `--copy` | Use file copy instead of symlinks |
| `-f, --force` | Force sync even if unchanged |
| `-v, --verbose` | Show detailed output |
| `--json` | JSON output |

## How Sync Works

Sync operates in two phases:

### Phase 1: Manifest Reconciliation

Scans `.synapsync/` directory and updates `manifest.json`:
- Detects new cognitives
- Removes deleted entries
- Updates modified content hashes

### Phase 2: Provider Sync

Creates symlinks in provider directories:
- Skills → folder symlinks
- Other types → file symlinks

```
.claude/skills/code-reviewer/ → ../../.synapsync/skills/general/code-reviewer/
.claude/agents/deploy-bot.md → ../../.synapsync/agents/general/deploy-bot/AGENT.md
```

## Examples

### Basic Sync

```bash
synapsync sync
```

```
Syncing cognitives...

Phase 1: Manifest
  ✓ Scanned 5 cognitives
  ✓ Added 1 new
  ✓ Manifest updated

Phase 2: Providers
  claude:
    ✓ Created skills/code-reviewer/
    ✓ Created agents/deploy-bot.md

✓ Sync complete
```

### Dry Run

```bash
synapsync sync --dry-run
```

```
[DRY RUN] Would sync:

Phase 1: Manifest
  + code-reviewer (new)
  ~ test-helper (modified)

Phase 2: Providers
  claude:
    + skills/code-reviewer/
    + agents/deploy-bot.md
```

### Sync Specific Type

```bash
synapsync sync --type skill
```

Only syncs skills, ignores agents/prompts/etc.

### Sync to Specific Provider

```bash
synapsync sync --provider cursor
```

Only syncs to Cursor, skips other providers.

### Force Copy Mode

```bash
synapsync sync --copy
```

Creates file copies instead of symlinks. Useful for:
- Windows environments
- Network drives
- When symlinks aren't supported

## Subcommand: status

Show current sync status without making changes:

```bash
synapsync sync status
```

```
Sync Status
───────────

Manifest: 5 cognitives tracked

Provider Status:
  claude:
    ✓ 4 synced
    ⚠ 1 orphaned (old-skill)

  cursor:
    ✓ 3 synced
    ✗ 2 missing
```

### Status with JSON

```bash
synapsync sync status --json
```

## Symlink Structure

| Cognitive Type | Sync Mode | Example |
|---------------|-----------|---------|
| skill | Folder | `.claude/skills/name/` → `.synapsync/skills/cat/name/` |
| agent | File | `.claude/agents/name.md` → `.synapsync/agents/cat/name/AGENT.md` |
| prompt | File | `.claude/prompts/name.md` → `.synapsync/prompts/cat/name/PROMPT.md` |
| workflow | File | `.claude/workflows/name.yaml` → `.synapsync/workflows/cat/name/WORKFLOW.yaml` |
| tool | File | `.claude/tools/name.md` → `.synapsync/tools/cat/name/TOOL.md` |

## Notes

- The `add` command syncs automatically, but you can run `sync` manually after editing cognitives
- Orphaned symlinks (pointing to deleted cognitives) are reported but not auto-removed
- Use `synapsync clean --orphans` to remove orphaned symlinks
