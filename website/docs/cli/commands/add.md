---
sidebar_position: 6
title: add
---

# synapsync add

Add cognitives from the registry, GitHub, or local files. Automatically syncs to configured providers after adding.

## Usage

```bash
synapsync add <source> [options]
```

## Options

| Option | Description |
|--------|-------------|
| `-t, --type <type>` | Cognitive type (skill, agent, prompt, workflow, tool) |
| `-c, --category <cat>` | Category for organization |
| `-f, --force` | Overwrite if exists |

## Sources

### Registry

Add by name from the public registry:

```bash
synapsync add code-reviewer
```

### GitHub

Using shorthand:

```bash
synapsync add github:user/repo
synapsync add github:user/repo#branch
```

Using full URL:

```bash
synapsync add https://github.com/user/repo
```

### Local Path

```bash
synapsync add ./path/to/cognitive
synapsync add /absolute/path/to/skill
```

## Examples

### Basic Add

```bash
synapsync add code-reviewer
```

```
✓ Found 'code-reviewer' in registry
✓ Downloaded to .synapsync/skills/general/code-reviewer/
✓ Installed code-reviewer v1.0.0
  Syncing to providers...
✓ Synced to claude (1 created)
```

### Add with Category

```bash
synapsync add react-patterns --category frontend
```

Saves to `.synapsync/skills/frontend/react-patterns/`

### Force Reinstall

```bash
synapsync add code-reviewer --force
```

Overwrites existing installation.

### Add Agent from GitHub

```bash
synapsync add github:synapsync/feature-branch-manager --type agent
```

## Installed Location

Cognitives are stored in `.synapsync/` organized by type and category:

```
.synapsync/
├── skills/
│   └── general/
│       └── code-reviewer/
│           └── SKILL.md
└── agents/
    └── devops/
        └── deploy-manager/
            └── AGENT.md
```

## Notes

- Cognitives are automatically synced to providers after adding
- Type is auto-detected from registry metadata
- Category defaults to `general` if not specified
- GitHub repos must contain a valid cognitive file (SKILL.md, AGENT.md, etc.)
