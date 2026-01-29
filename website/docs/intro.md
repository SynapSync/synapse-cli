---
sidebar_position: 1
slug: /
title: Introduction
---

# SynapSync CLI

**The unified CLI for managing AI cognitives across multiple providers.**

SynapSync lets you install, organize, and sync AI capabilities (skills, agents, prompts, workflows, and tools) to any AI provider—Claude, OpenAI, Cursor, Windsurf, Gemini, or Copilot—from a single source of truth.

## Why SynapSync?

| Problem | Solution |
|---------|----------|
| Scattered AI configurations across projects | Central `.synapsync/` storage with symlink sync |
| Manually copying prompts between tools | One `sync` command updates all providers |
| No standard way to share AI capabilities | Public registry + GitHub installation |
| Different formats per provider | Unified cognitive format, automatic adaptation |

## Quick Start

```bash
# Install globally
npm install -g @synapsync/cli

# Initialize in your project
synapsync init

# Add a cognitive from the registry
synapsync add code-reviewer

# Done! The cognitive is now available in your AI tools
```

## Key Features

- **Multi-provider sync** — Claude, OpenAI, Cursor, Windsurf, Gemini, Copilot
- **5 cognitive types** — Skills, Agents, Prompts, Workflows, Tools
- **Multiple sources** — Registry, GitHub, local files
- **Symlink-based** — Single source of truth, no duplication
- **Interactive REPL** — Run `synapsync` for interactive mode

## How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Registry /    │────▶│   .synapsync/    │────▶│   Providers     │
│   GitHub /      │     │   (central)      │     │   .claude/      │
│   Local         │     │                  │     │   .cursor/      │
└─────────────────┘     └──────────────────┘     │   .openai/      │
     install                  sync               └─────────────────┘
```

1. **Install** — Download cognitives to `.synapsync/`
2. **Sync** — Create symlinks to provider directories
3. **Use** — Cognitives are available in your AI tools

## Next Steps

- [**Installation**](/getting-started) — Set up SynapSync in 2 minutes
- [**Commands**](/cli/commands) — Full CLI reference
- [**Cognitives**](/concepts/cognitives) — Understanding cognitive types
- [**Registry**](/registry/overview) — Browse and publish cognitives
