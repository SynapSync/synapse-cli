# Skill Architecture

> Documento que describe la arquitectura de almacenamiento y sincronizacion de skills en SynapSync CLI.

---

## 1. Overview

SynapSync organiza los skills en una estructura centralizada por **departamento** (o scope/type), permitiendo una gestion ordenada del "cerebro" de capabilities. Cuando se sincronizan con proveedores de IA, los skills se exponen en formato flat (sin departamentos) segun los requerimientos de cada proveedor.

---

## 2. Directory Structure

### 2.1 Central Brain Storage

```
.agents/                          # Base directory (configurable)
└── skills/                       # All skills
    ├── frontend/                 # Department: Frontend
    │   ├── component-generator/
    │   │   └── SKILL.md
    │   ├── css-optimizer/
    │   │   └── SKILL.md
    │   └── react-patterns/
    │       └── SKILL.md
    │
    ├── backend/                  # Department: Backend
    │   ├── api-designer/
    │   │   └── SKILL.md
    │   ├── auth-helper/
    │   │   └── SKILL.md
    │   └── db-query-optimizer/
    │       └── SKILL.md
    │
    ├── database/                 # Department: Database
    │   ├── schema-designer/
    │   │   └── SKILL.md
    │   └── migration-generator/
    │       └── SKILL.md
    │
    ├── devops/                   # Department: DevOps
    │   ├── dockerfile-creator/
    │   │   └── SKILL.md
    │   ├── ci-pipeline/
    │   │   └── SKILL.md
    │   └── k8s-manifest/
    │       └── SKILL.md
    │
    ├── security/                 # Department: Security
    │   ├── vulnerability-scanner/
    │   │   └── SKILL.md
    │   └── code-auditor/
    │       └── SKILL.md
    │
    ├── growth/                   # Department: Growth/Marketing
    │   ├── seo-optimizer/
    │   │   └── SKILL.md
    │   └── analytics-setup/
    │       └── SKILL.md
    │
    ├── testing/                  # Department: Testing/QA
    │   ├── test-generator/
    │   │   └── SKILL.md
    │   └── e2e-writer/
    │       └── SKILL.md
    │
    └── general/                  # Department: General purpose
        ├── code-reviewer/
        │   └── SKILL.md
        ├── documentation/
        │   └── SKILL.md
        └── task-creator/
            └── SKILL.md
```

### 2.2 Provider-Specific Directories (Flat Structure)

Los proveedores leen skills en estructura flat, sin departamentos:

```
.claude/                          # Claude provider
└── skills/
    ├── component-generator/      # <- Symlink to .agents/skills/frontend/component-generator/
    │   └── SKILL.md
    ├── api-designer/             # <- Symlink to .agents/skills/backend/api-designer/
    │   └── SKILL.md
    ├── code-reviewer/            # <- Symlink to .agents/skills/general/code-reviewer/
    │   └── SKILL.md
    └── ...

.gemini/                          # Gemini provider
└── skills/
    ├── component-generator/
    │   └── SKILL.md
    ├── api-designer/
    │   └── SKILL.md
    └── ...

.codex/                           # OpenAI Codex provider
└── skills/
    ├── component-generator/
    │   └── SKILL.md
    └── ...

.cursor/                          # Cursor IDE
└── skills/
    └── ...
```

---

## 3. Configuration

### 3.1 Environment Variables

```bash
# .env or system environment
SYNAPSYNC_AGENTS_DIR=.agents      # Base directory for central storage
SYNAPSYNC_SKILLS_SUBDIR=skills    # Subdirectory for skills
```

### 3.2 Config File

```yaml
# synapsync.config.yaml
storage:
  agents_dir: .agents             # Can be absolute or relative path
  skills_subdir: skills           # Subdirectory within agents_dir

# Full path: {agents_dir}/{skills_subdir}/{department}/{skill-name}/SKILL.md

sync:
  method: symlink                 # symlink | copy
  providers:
    claude:
      enabled: true
      path: .claude/skills
    gemini:
      enabled: true
      path: .gemini/skills
    codex:
      enabled: true
      path: .codex/skills
    cursor:
      enabled: false
      path: .cursor/skills
```

### 3.3 Constants (Internal)

```typescript
// src/core/constants.ts
export const DEFAULT_AGENTS_DIR = '.agents';
export const DEFAULT_SKILLS_SUBDIR = 'skills';
export const SKILL_FILE_NAME = 'SKILL.md';

export const DEPARTMENTS = [
  'frontend',
  'backend',
  'database',
  'devops',
  'security',
  'growth',
  'testing',
  'general',
  // Extensible - users can add custom departments
] as const;

export const PROVIDER_PATHS: Record<string, string> = {
  claude: '.claude/skills',
  gemini: '.gemini/skills',
  codex: '.codex/skills',
  cursor: '.cursor/skills',
  windsurf: '.windsurf/skills',
  // Extensible via config
};
```

---

## 4. Skill File Format

### 4.1 SKILL.md Structure

```markdown
---
name: code-reviewer
version: 1.0.0
department: general
description: Comprehensive code review with best practices
author: synapsync-community
tags:
  - review
  - quality
  - best-practices
providers:
  - claude
  - gemini
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

### 4.2 Metadata Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique skill identifier (kebab-case) |
| `version` | Yes | Semantic version |
| `department` | Yes | Department/scope classification |
| `description` | Yes | Brief description |
| `author` | No | Author or organization |
| `tags` | No | Searchable tags |
| `providers` | No | Compatible providers (all if empty) |

---

## 5. Commands Behavior

### 5.1 Install Command

```bash
# Install skill to central storage
synapsync install code-reviewer

# Behavior:
# 1. Download skill from registry
# 2. Detect or prompt for department
# 3. Save to .agents/skills/{department}/{skill-name}/SKILL.md
# 4. Update local manifest
```

```bash
# Install with explicit department
synapsync install code-reviewer --department general
synapsync install component-generator --department frontend
```

### 5.2 Sync Command

```bash
synapsync sync
```

**Interactive Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                     SynapSync Skill Sync                        │
└─────────────────────────────────────────────────────────────────┘

📦 Available Skills (23 total)

  frontend/ (5 skills)
    ├── component-generator
    ├── css-optimizer
    ├── react-patterns
    ├── tailwind-helper
    └── accessibility-checker

  backend/ (4 skills)
    ├── api-designer
    ├── auth-helper
    ├── db-query-optimizer
    └── rest-validator

  devops/ (3 skills)
    ├── dockerfile-creator
    ├── ci-pipeline
    └── k8s-manifest

  general/ (6 skills)
    ├── code-reviewer
    ├── documentation
    ├── task-creator
    ├── git-commit
    ├── refactor-helper
    └── test-generator

  [... more departments]

? Select skills to sync:
  ◉ All skills (23)
  ○ By department
  ○ Select individual skills

? Select target providers:
  ◉ claude (.claude/skills)
  ◉ gemini (.gemini/skills)
  ○ codex (.codex/skills)
  ○ cursor (.cursor/skills)

? Sync method:
  ◉ Symlink (Recommended) - Changes reflect automatically
  ○ Copy - Independent copies in each provider folder

⠋ Syncing 23 skills to 2 providers...

✓ Synced to .claude/skills (23 symlinks)
✓ Synced to .gemini/skills (23 symlinks)

┌───────────────────────────────────────┐
│            Sync Complete              │
├───────────────────────────────────────┤
│  Skills synced: 23                    │
│  Providers: claude, gemini            │
│  Method: symlink                      │
│  Conflicts: 0                         │
└───────────────────────────────────────┘
```

### 5.3 Sync Options

```bash
# Sync all to all configured providers
synapsync sync

# Sync to specific provider
synapsync sync --provider claude

# Sync specific department
synapsync sync --department frontend

# Sync specific skill
synapsync sync code-reviewer

# Non-interactive (use config defaults)
synapsync sync --yes

# Force copy instead of symlink
synapsync sync --copy

# Force symlink (default)
synapsync sync --symlink

# Dry run - show what would happen
synapsync sync --dry-run
```

---

## 6. Symlink vs Copy

### 6.1 Symlink (Recommended)

**Advantages:**
- Single source of truth in `.agents/`
- Changes to skill reflect immediately in all providers
- Less disk space
- Easier to manage updates

**Structure:**
```
.claude/skills/code-reviewer -> ../../.agents/skills/general/code-reviewer
```

**Code:**
```typescript
import { symlink, readlink } from 'fs/promises';
import path from 'path';

async function createSkillSymlink(
  sourcePath: string,  // .agents/skills/general/code-reviewer
  targetPath: string   // .claude/skills/code-reviewer
): Promise<void> {
  const relativePath = path.relative(
    path.dirname(targetPath),
    sourcePath
  );
  await symlink(relativePath, targetPath, 'dir');
}
```

### 6.2 Copy

**Advantages:**
- Works on all systems (some Windows configs don't support symlinks)
- Independent copies that can be modified per-provider
- No dependency on central storage

**Disadvantages:**
- Changes must be synced manually
- More disk space
- Risk of divergent copies

**When to use:**
- Windows without symlink support
- When provider-specific modifications are needed
- When deploying to systems that don't preserve symlinks

---

## 7. Data Models

### 7.1 Skill

```typescript
interface Skill {
  name: string;                    // 'code-reviewer'
  version: string;                 // '1.0.0'
  department: Department;          // 'general'
  description: string;
  author?: string;
  tags?: string[];
  providers?: string[];            // Compatible providers
  content: string;                 // Full SKILL.md content
  path: string;                    // Full path to SKILL.md
}

type Department =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'devops'
  | 'security'
  | 'growth'
  | 'testing'
  | 'general'
  | string;  // Custom departments allowed
```

### 7.2 Skill Registry (Local)

```typescript
// .agents/skills.manifest.json
interface SkillManifest {
  version: string;
  lastUpdated: Date;
  skills: {
    [skillName: string]: {
      department: Department;
      version: string;
      installedAt: Date;
      source: 'registry' | 'local' | 'git';
      sourceUrl?: string;
    };
  };
  syncs: {
    [provider: string]: {
      lastSync: Date;
      method: 'symlink' | 'copy';
      skills: string[];  // List of synced skill names
    };
  };
}
```

### 7.3 Provider Config

```typescript
interface ProviderSyncConfig {
  name: string;           // 'claude'
  enabled: boolean;
  path: string;           // '.claude/skills'
  skillsSubdir: string;   // 'skills' (some providers might differ)
  supportsSymlinks: boolean;
}
```

---

## 8. Edge Cases

### 8.1 Skill Name Conflicts

If two departments have skills with the same name:

```
.agents/skills/frontend/validator/SKILL.md
.agents/skills/backend/validator/SKILL.md
```

**Resolution:**
- When syncing, warn about conflict
- Offer options:
  1. Rename one skill (validator-frontend, validator-backend)
  2. Skip one
  3. Merge (if compatible)

### 8.2 Provider Doesn't Support Symlinks

```typescript
async function syncToProvider(
  provider: ProviderSyncConfig,
  skills: Skill[],
  preferredMethod: 'symlink' | 'copy'
): Promise<SyncResult> {
  let method = preferredMethod;

  if (preferredMethod === 'symlink' && !provider.supportsSymlinks) {
    console.warn(`Provider ${provider.name} doesn't support symlinks, using copy`);
    method = 'copy';
  }

  // ... sync logic
}
```

### 8.3 Skill Updates

When a skill is updated in central storage:

- **Symlink:** Changes reflect immediately
- **Copy:** Need to re-run `synapsync sync` to update copies

---

## 9. Migration Path

### 9.1 From Flat Structure

If user has existing flat skills:

```bash
synapsync migrate --from flat --to departments
```

```
Found 15 skills in .agents/skills/ without department structure.

? How would you like to organize them?
  ◉ Auto-detect based on skill content/tags
  ○ Assign all to 'general'
  ○ Interactive assignment

Analyzing skills...
  code-reviewer -> general (confidence: 95%)
  react-hooks -> frontend (confidence: 90%)
  api-security -> security (confidence: 88%)
  ...

? Proceed with migration? (Y/n)
```

### 9.2 From Provider-Specific

If user has skills directly in provider folders:

```bash
synapsync import --from .claude/skills
```

---

## 10. Future Considerations

### 10.1 Remote Sync

Sync skills to cloud storage for multi-machine access:

```yaml
sync:
  remote:
    enabled: true
    provider: github  # or gist, s3, etc.
    repo: user/my-skills
```

### 10.2 Team Sharing

Share skills with team via private registry or git:

```bash
synapsync share code-reviewer --team myteam
synapsync pull --team myteam
```

### 10.3 Skill Inheritance

Skills that extend other skills:

```yaml
---
name: react-code-reviewer
extends: code-reviewer
department: frontend
---
```

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01-27 | Initial architecture document |
