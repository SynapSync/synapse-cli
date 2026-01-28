# Asset Architecture

> Documento que describe la arquitectura de almacenamiento y sincronizacion de assets en SynapSync CLI.

---

## 1. Overview

SynapSync gestiona multiples tipos de **assets de IA** (skills, agents, prompts, workflows, tools) en una estructura centralizada por **categoria**, permitiendo una gestion ordenada del "cerebro" de capacidades. Cuando se sincronizan con proveedores de IA, los assets se exponen en formato flat (sin categorias) segun los requerimientos de cada proveedor.

---

## 2. Asset Types

SynapSync soporta los siguientes tipos de assets:

| Type | File | Description |
|------|------|-------------|
| **skill** | `SKILL.md` | Instrucciones reutilizables para asistentes de IA |
| **agent** | `AGENT.md` | Entidades AI autonomas con comportamientos especificos |
| **prompt** | `PROMPT.md` | Templates de prompts reutilizables con variables |
| **workflow** | `WORKFLOW.yaml` | Procesos multi-paso que combinan agentes y prompts |
| **tool** | `TOOL.md` | Integraciones externas y funciones |

---

## 3. Directory Structure

### 3.1 Central Storage

```
.synapsync/                           # Base directory (configurable)
├── manifest.json                     # Central manifest of all assets
│
├── skills/                           # Skills by category
│   ├── frontend/
│   │   ├── component-generator/
│   │   │   └── SKILL.md
│   │   ├── css-optimizer/
│   │   │   └── SKILL.md
│   │   └── react-patterns/
│   │       └── SKILL.md
│   ├── backend/
│   │   ├── api-designer/
│   │   │   └── SKILL.md
│   │   └── db-query-optimizer/
│   │       └── SKILL.md
│   ├── security/
│   │   └── vulnerability-scanner/
│   │       └── SKILL.md
│   └── general/
│       ├── code-reviewer/
│       │   └── SKILL.md
│       └── documentation/
│           └── SKILL.md
│
├── agents/                           # Agents by category
│   ├── automation/
│   │   ├── ci-agent/
│   │   │   └── AGENT.md
│   │   └── deploy-agent/
│   │       └── AGENT.md
│   ├── testing/
│   │   └── test-runner-agent/
│   │       └── AGENT.md
│   └── general/
│       └── reviewer-agent/
│           └── AGENT.md
│
├── prompts/                          # Prompts by category
│   ├── frontend/
│   │   └── component-spec/
│   │       └── PROMPT.md
│   ├── backend/
│   │   └── api-spec/
│   │       └── PROMPT.md
│   └── general/
│       ├── code-review/
│       │   └── PROMPT.md
│       └── summarize/
│           └── PROMPT.md
│
├── workflows/                        # Workflows by category
│   ├── devops/
│   │   ├── deploy-pipeline/
│   │   │   └── WORKFLOW.yaml
│   │   └── release-workflow/
│   │       └── WORKFLOW.yaml
│   └── testing/
│       └── full-test-suite/
│           └── WORKFLOW.yaml
│
└── tools/                            # Tools by category
    ├── integrations/
    │   ├── github-integration/
    │   │   └── TOOL.md
    │   └── slack-notifier/
    │       └── TOOL.md
    └── general/
        └── file-processor/
            └── TOOL.md
```

### 3.2 Provider-Specific Directories (Flat Structure)

Los proveedores leen assets en estructura flat, sin categorias:

```
.claude/                              # Claude provider
├── skills/
│   ├── component-generator/          # <- Symlink to .synapsync/skills/frontend/component-generator/
│   ├── api-designer/                 # <- Symlink to .synapsync/skills/backend/api-designer/
│   └── code-reviewer/                # <- Symlink to .synapsync/skills/general/code-reviewer/
├── agents/
│   ├── ci-agent/                     # <- Symlink to .synapsync/agents/automation/ci-agent/
│   └── reviewer-agent/               # <- Symlink to .synapsync/agents/general/reviewer-agent/
├── prompts/
│   └── code-review/                  # <- Symlink to .synapsync/prompts/general/code-review/
├── workflows/
│   └── deploy-pipeline/              # <- Symlink to .synapsync/workflows/devops/deploy-pipeline/
└── tools/
    └── github-integration/           # <- Symlink to .synapsync/tools/integrations/github-integration/

.openai/                              # OpenAI provider
├── skills/
├── agents/
├── prompts/
└── tools/

.cursor/                              # Cursor IDE
├── skills/
├── agents/
└── prompts/
```

---

## 4. Configuration

### 4.1 Environment Variables

```bash
# .env or system environment
SYNAPSYNC_DIR=.synapsync              # Base directory for central storage
```

### 4.2 Config File

```yaml
# synapsync.config.yaml
storage:
  dir: .synapsync                     # Can be absolute or relative path

sync:
  method: symlink                     # symlink | copy
  providers:
    claude:
      enabled: true
      paths:
        skill: .claude/skills
        agent: .claude/agents
        prompt: .claude/prompts
        workflow: .claude/workflows
        tool: .claude/tools
    openai:
      enabled: true
      paths:
        skill: .openai/skills
        agent: .openai/agents
        prompt: .openai/prompts
    cursor:
      enabled: false
```

### 4.3 Constants (Internal)

```typescript
// src/core/constants.ts
export const ASSET_TYPES = ['skill', 'agent', 'prompt', 'workflow', 'tool'] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

export const ASSET_FILE_NAMES: Record<AssetType, string> = {
  skill: 'SKILL.md',
  agent: 'AGENT.md',
  prompt: 'PROMPT.md',
  workflow: 'WORKFLOW.yaml',
  tool: 'TOOL.md',
};

export const DEFAULT_SYNAPSYNC_DIR = '.synapsync';

export const CATEGORIES = [
  'frontend',
  'backend',
  'database',
  'devops',
  'security',
  'testing',
  'analytics',
  'automation',
  'general',
] as const;

export const SUPPORTED_PROVIDERS = [
  'claude',
  'openai',
  'gemini',
  'cursor',
  'windsurf',
  'copilot',
] as const;

export const PROVIDER_PATHS: Record<SupportedProvider, Record<AssetType, string>> = {
  claude: {
    skill: '.claude/skills',
    agent: '.claude/agents',
    prompt: '.claude/prompts',
    workflow: '.claude/workflows',
    tool: '.claude/tools',
  },
  // ... other providers
};
```

---

## 5. Asset File Formats

### 5.1 SKILL.md Structure

```markdown
---
name: code-reviewer
type: skill
version: 1.0.0
category: general
description: Comprehensive code review with best practices
author: synapsync-community
tags:
  - review
  - quality
  - best-practices
providers:
  - claude
  - openai
---

# Code Reviewer

You are an expert code reviewer...

## Instructions

1. Analyze the code for...
2. Check for...

## Output Format

...
```

### 5.2 AGENT.md Structure

```markdown
---
name: ci-agent
type: agent
version: 1.0.0
category: automation
description: Autonomous CI/CD agent
author: synapsync-community
capabilities:
  - run-tests
  - deploy
  - notify
tags:
  - ci
  - automation
providers:
  - claude
---

# CI Agent

You are an autonomous CI/CD agent...

## System Prompt

...

## Behaviors

...
```

### 5.3 PROMPT.md Structure

```markdown
---
name: code-review-prompt
type: prompt
version: 1.0.0
category: general
description: Template for code review requests
variables:
  - code
  - language
  - focus_areas
examples:
  - "Review this Python function for security issues"
---

# Code Review Prompt

Review the following {language} code:

```{language}
{code}
```

Focus on: {focus_areas}

...
```

### 5.4 WORKFLOW.yaml Structure

```yaml
name: deploy-pipeline
type: workflow
version: 1.0.0
category: devops
description: Full deployment pipeline

steps:
  - id: lint
    name: Run Linter
    type: tool
    tool: eslint

  - id: test
    name: Run Tests
    type: agent
    agent: test-runner-agent

  - id: review
    name: Code Review
    type: prompt
    prompt: code-review-prompt
    condition: "steps.test.passed"

  - id: deploy
    name: Deploy
    type: agent
    agent: deploy-agent
    condition: "steps.review.approved"

  - id: notify
    name: Notify Team
    type: tool
    tool: slack-notifier
```

### 5.5 TOOL.md Structure

```markdown
---
name: github-integration
type: tool
version: 1.0.0
category: integrations
description: GitHub API integration
endpoint: https://api.github.com
schema:
  type: object
  properties:
    action:
      type: string
      enum: [create-pr, merge-pr, create-issue]
    repo:
      type: string
---

# GitHub Integration

Tool for interacting with GitHub API...

## Actions

### create-pr
...

### merge-pr
...
```

---

## 6. Commands Behavior

### 6.1 Install Command

```bash
# Install asset to central storage
synapsync install code-reviewer

# Behavior:
# 1. Download asset from registry
# 2. Detect asset type from metadata
# 3. Detect or prompt for category
# 4. Save to .synapsync/{asset-type}s/{category}/{asset-name}/{FILE}
# 5. Update manifest.json
```

```bash
# Install with explicit category
synapsync install code-reviewer --category general
synapsync install ci-agent --category automation

# Install specific asset type
synapsync install code-review-prompt --type prompt
```

### 6.2 Sync Command

```bash
synapsync sync
```

**Interactive Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     SynapSync Asset Sync                         │
└─────────────────────────────────────────────────────────────────┘

📦 Available Assets (35 total)

  Skills (15):
    frontend/ (5) │ backend/ (4) │ security/ (2) │ general/ (4)

  Agents (8):
    automation/ (3) │ testing/ (2) │ general/ (3)

  Prompts (7):
    frontend/ (2) │ backend/ (2) │ general/ (3)

  Workflows (3):
    devops/ (2) │ testing/ (1)

  Tools (2):
    integrations/ (2)

? Select assets to sync:
  ◉ All assets (35)
  ○ By type (skills, agents, etc.)
  ○ By category
  ○ Select individual assets

? Select target providers:
  ◉ claude
  ◉ openai
  ○ cursor

? Sync method:
  ◉ Symlink (Recommended) - Changes reflect automatically
  ○ Copy - Independent copies in each provider folder

⠋ Syncing 35 assets to 2 providers...

✓ Synced to .claude/ (35 symlinks)
✓ Synced to .openai/ (35 symlinks)

┌───────────────────────────────────────┐
│            Sync Complete              │
├───────────────────────────────────────┤
│  Assets synced: 35                    │
│  Providers: claude, openai            │
│  Method: symlink                      │
│  Conflicts: 0                         │
└───────────────────────────────────────┘
```

### 6.3 Sync Options

```bash
# Sync all to all configured providers
synapsync sync

# Sync to specific provider
synapsync sync --provider claude

# Sync specific asset type
synapsync sync --type skill
synapsync sync --type agent

# Sync specific category
synapsync sync --category frontend

# Sync specific asset
synapsync sync code-reviewer

# Non-interactive (use config defaults)
synapsync sync --yes

# Force copy instead of symlink
synapsync sync --copy

# Dry run - show what would happen
synapsync sync --dry-run
```

---

## 7. Symlink vs Copy

### 7.1 Symlink (Recommended)

**Advantages:**
- Single source of truth in `.synapsync/`
- Changes to asset reflect immediately in all providers
- Less disk space
- Easier to manage updates

**Structure:**
```
.claude/skills/code-reviewer -> ../../.synapsync/skills/general/code-reviewer
.claude/agents/ci-agent -> ../../.synapsync/agents/automation/ci-agent
```

### 7.2 Copy

**Advantages:**
- Works on all systems (some Windows configs don't support symlinks)
- Independent copies that can be modified per-provider
- No dependency on central storage

**When to use:**
- Windows without symlink support
- When provider-specific modifications are needed
- When deploying to systems that don't preserve symlinks

---

## 8. Data Models

### 8.1 Asset (Base)

```typescript
interface AssetMetadata {
  name: string;
  type: AssetType;
  version: string;
  category: Category;
  description: string;
  author?: string;
  tags?: string[];
  providers?: SupportedProvider[];
}

interface Asset extends AssetMetadata {
  content: string;
  path: string;
}
```

### 8.2 Specialized Assets

```typescript
interface Skill extends Asset {
  type: 'skill';
}

interface Agent extends Asset {
  type: 'agent';
  capabilities?: string[];
  systemPrompt?: string;
}

interface Prompt extends Asset {
  type: 'prompt';
  variables?: string[];
  examples?: string[];
}

interface Workflow extends Asset {
  type: 'workflow';
  steps?: WorkflowStep[];
}

interface Tool extends Asset {
  type: 'tool';
  schema?: Record<string, unknown>;
  endpoint?: string;
}
```

### 8.3 Manifest

```typescript
// .synapsync/manifest.json
interface SynapSyncManifest {
  version: string;
  lastUpdated: string;
  assets: Record<string, InstalledAsset>;
  syncs: Record<SupportedProvider, {
    lastSync: string;
    method: 'symlink' | 'copy';
    assets: string[];
  }>;
}

interface InstalledAsset {
  name: string;
  type: AssetType;
  category: Category;
  version: string;
  installedAt: Date;
  source: 'registry' | 'local' | 'git';
  sourceUrl?: string;
}
```

---

## 9. Edge Cases

### 9.1 Asset Name Conflicts

If two categories have assets with the same name:

```
.synapsync/skills/frontend/validator/SKILL.md
.synapsync/skills/backend/validator/SKILL.md
```

**Resolution:**
- When syncing, warn about conflict
- Offer options:
  1. Rename one asset (validator-frontend, validator-backend)
  2. Skip one
  3. Use qualified name in provider

### 9.2 Cross-Asset Type Conflicts

If different asset types have the same name:

```
.synapsync/skills/general/code-review/SKILL.md
.synapsync/prompts/general/code-review/PROMPT.md
```

**Resolution:**
- These sync to different directories (skills/ vs prompts/)
- No conflict at provider level

---

## 10. Future Considerations

### 10.1 Asset Composition

Assets that reference other assets:

```yaml
# WORKFLOW.yaml
steps:
  - type: skill
    skill: code-reviewer
  - type: agent
    agent: ci-agent
  - type: prompt
    prompt: summarize
```

### 10.2 Asset Inheritance

Assets that extend other assets:

```yaml
---
name: react-code-reviewer
extends: code-reviewer
category: frontend
---
```

### 10.3 Remote Sync

Sync assets to cloud storage for multi-machine access:

```yaml
sync:
  remote:
    enabled: true
    provider: github
    repo: user/my-synapsync-assets
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-27 | Initial architecture document (skills only) |
| 2.0.0 | 2025-01-27 | Expanded to multi-asset architecture |
