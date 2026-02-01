---
sidebar_position: 2
title: Publishing
---

# Publishing to Registry

Share your cognitives with the community by submitting them to the registry.

## Current Process

The registry accepts contributions via **Pull Request** to the [synapse-registry](https://github.com/SynapSync/synapse-registry) repository.

## Submission Steps

### 1. Prepare Your Cognitive

Create a folder with required files:

```
my-cognitive/
├── metadata.json      # Required
├── SKILL.md          # Or AGENT.md, PROMPT.md, etc.
└── assets/           # Optional
    └── template.md
```

### 2. Create metadata.json

```json
{
  "name": "my-cognitive",
  "type": "skill",
  "version": "1.0.0",
  "description": "Brief description of what it does",
  "author": "your-github-username",
  "category": "general",
  "tags": ["relevant", "tags"],
  "providers": ["claude", "cursor"]
}
```

### 3. Write the Cognitive

Include YAML frontmatter:

```markdown
---
name: my-cognitive
description: Brief description
version: 1.0.0
---

# My Cognitive

Instructions for the AI...
```

### 4. Submit Pull Request

1. Fork [synapse-registry](https://github.com/SynapSync/synapse-registry)
2. Add your cognitive to the appropriate folder:
   - `skills/` for skills
   - `agents/` for agents
   - etc.
3. Submit a PR with:
   - Description of the cognitive
   - Example use cases
   - Tested providers

## Guidelines

### Naming

- Use lowercase with hyphens: `code-reviewer`
- Be descriptive but concise
- Avoid generic names like `helper` or `utility`

### Documentation

- Clear explanation of purpose
- Usage examples
- Any prerequisites or requirements

### Versioning

Follow [semver](https://semver.org/):
- `1.0.0` — Initial release
- `1.0.1` — Bug fixes
- `1.1.0` — New features (backwards compatible)
- `2.0.0` — Breaking changes

### Categories

Choose from:
- `frontend` — UI/UX, React, Vue, CSS
- `backend` — APIs, servers, databases
- `database` — SQL, migrations
- `devops` — CI/CD, Docker, K8s
- `security` — Audits, vulnerabilities
- `testing` — Unit tests, E2E
- `analytics` — Metrics, monitoring
- `automation` — Scripts, workflows
- `general` — Multi-purpose

## Review Process

1. **Automated checks** — Metadata validation, file structure
2. **Manual review** — Quality, documentation, security
3. **Approval** — Merged and available in registry

## Updating Published Cognitives

1. Bump version in `metadata.json`
2. Update the cognitive file
3. Submit PR with changelog

## Future: CLI Publishing

A future release will add direct CLI publishing:

```bash
# Not yet implemented
synapsync login
synapsync publish ./my-cognitive
```

See [ideas/registry-publishing](https://github.com/SynapSync/synapse-cli/blob/main/docs/ideas/registry-publishing.md) for the proposal.
