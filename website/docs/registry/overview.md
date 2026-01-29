---
sidebar_position: 1
title: Registry Overview
---

# Registry

The SynapSync Registry is a public collection of cognitives shared by the community.

## What's in the Registry

The registry contains cognitives of all types:

- **Skills** — Code review, testing patterns, framework guides
- **Agents** — Feature branch managers, deployment bots
- **Prompts** — Reusable prompt templates
- **Workflows** — CI/CD pipelines, review processes
- **Tools** — API integrations, utilities

## Browsing the Registry

### From CLI

```bash
# List all cognitives
synapsync list --remote

# Search by query
synapsync search react

# Filter by type
synapsync search --type skill

# Filter by category
synapsync search --category security
```

### Online

Visit [registry.synapsync.dev](https://registry.synapsync.dev) to browse cognitives with previews.

## Installing from Registry

```bash
# Add from registry
synapsync add code-reviewer

# Add with category
synapsync add react-patterns --category frontend
```

## Registry Structure

The registry is a GitHub repository with this structure:

```
synapse-registry/
├── registry.json           # Index of all cognitives
├── skills/
│   ├── code-reviewer/
│   │   ├── metadata.json
│   │   └── SKILL.md
│   └── react-patterns/
│       ├── metadata.json
│       ├── SKILL.md
│       └── assets/
├── agents/
│   └── feature-branch-manager/
│       ├── metadata.json
│       └── AGENT.md
└── ...
```

## Cognitive Metadata

Each cognitive has a `metadata.json`:

```json
{
  "name": "code-reviewer",
  "type": "skill",
  "version": "1.0.0",
  "description": "Reviews code for best practices and issues",
  "author": "synapsync",
  "category": "general",
  "tags": ["code-review", "quality", "best-practices"],
  "providers": ["claude", "cursor", "openai"]
}
```

## Quality Standards

Registry cognitives are reviewed for:

- Clear documentation
- Working examples
- No security issues
- Proper metadata
- Provider compatibility

## Contributing

See [Publishing](/registry/publishing) to submit your cognitives.
