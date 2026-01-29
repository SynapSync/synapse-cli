---
sidebar_position: 2
title: Getting Started
---

# Getting Started

Get SynapSync running in your project in under 2 minutes.

## Prerequisites

- **Node.js** 20.0.0 or higher
- **npm** 10.0.0 or higher

```bash
node --version  # Should be v20+
```

## Installation

```bash
npm install -g @synapsync/cli
```

Verify the installation:

```bash
synapsync --version
```

## Initialize Your Project

Navigate to your project and run:

```bash
synapsync init
```

This creates:
- `synapsync.config.yaml` — Project configuration
- `.synapsync/` — Central cognitive storage
- `.synapsync/manifest.json` — Installed cognitives tracker

### Non-interactive Mode

```bash
synapsync init --yes
```

Uses defaults: project name from directory, Claude provider enabled.

## Install Your First Cognitive

Browse available cognitives:

```bash
synapsync search
```

Install one:

```bash
synapsync add code-reviewer
```

Your cognitive is automatically synced to your configured providers.

## Verify Setup

Check your project status:

```bash
synapsync status
```

```
Project Status
──────────────

Initialized:    Yes
Config:         synapsync.config.yaml
Storage:        .synapsync/

Cognitives:     1 installed
  Skills:       1
  Agents:       0
  ...

Providers:
  claude:       enabled (.claude/)
```

## Project Structure

After setup, your project looks like:

```
your-project/
├── synapsync.config.yaml    # Configuration
├── .synapsync/
│   ├── manifest.json        # Tracks installed cognitives
│   └── skills/
│       └── general/
│           └── code-reviewer/
│               └── SKILL.md
└── .claude/                  # Provider directory (symlinked)
    └── skills/
        └── code-reviewer/    # → ../.synapsync/skills/general/code-reviewer/
```

## Next Steps

- [Browse the registry](/cli/commands/search) — Find more cognitives
- [Configure providers](/concepts/providers) — Enable more AI tools
- [Publishing cognitives](/registry/publishing) — Share with the community
