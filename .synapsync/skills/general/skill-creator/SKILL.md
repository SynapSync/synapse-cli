---
name: skill-creator
description: >
  Creates new AI agent skills following the SynapSync spec with enhanced templates and guidelines.
  Trigger: When user asks to create a new skill, add agent instructions, or document patterns for AI.
license: Apache-2.0
metadata:
  author: synapsync
  version: "3.0"
  scope: [root]
  auto_invoke: "when user asks to create, document, refactor or standardize agent skills"
  changelog:
    - version: "3.0"
      date: "2026-01-28"
      changes:
        - "Migrated to SynapSync ecosystem"
        - "Updated categories to match SynapSync registry"
        - "Updated sync command to synapsync sync"
        - "Updated paths to .synapsync/skills/"
    - version: "2.3"
      date: "2026-01-20"
      changes:
        - "Added Skill Evaluation Checklist for quick validation"
        - "Added 'Default to NO' principle for skill creation"
    - version: "2.2"
      date: "2026-01-20"
      changes:
        - "Added Common Anti-Patterns section with 10 specific anti-patterns"
        - "Split templates into SKILL-TEMPLATE-BASIC.md and SKILL-TEMPLATE-ADVANCED.md"
    - version: "2.1"
      date: "2026-01-20"
      changes:
        - "Added Basic and Advanced templates for different skill complexities"
        - "Added Template Selection Guide with decision trees"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## When to Create a Skill

### Skill Evaluation Checklist

Before creating a skill, ALL of these must be YES:

- [ ] **Reusable?** - Pattern will be used 3+ times
- [ ] **Stable?** - Pattern won't change frequently
- [ ] **Valuable?** - Provides guidance beyond obvious best practices
- [ ] **Explicit trigger?** - Clear action/context that invokes it
- [ ] **No existing equivalent?** - Similar skill doesn't already exist

**If ANY answer is NO → Do NOT create the skill.**

### Create a skill when:

- A pattern is used repeatedly and AI needs guidance
- Project-specific conventions differ from generic best practices
- Complex workflows need step-by-step instructions
- Decision trees help AI choose the right approach

### Don't create a skill when:

- Documentation already exists (create a reference instead)
- Pattern is trivial or self-explanatory
- It's a one-off task
- **When in doubt: DEFAULT TO NO** - It's easier to add a skill later than to maintain unnecessary ones

---

## Common Anti-Patterns

Avoid these mistakes when creating skills:

### Anti-Pattern 1: Duplicating Existing Documentation

**Problem**: Creating a skill that just repeats what's already in project docs
**Instead**: Create a skill with a `references/` folder pointing to existing docs, or add context that docs don't provide

### Anti-Pattern 2: Vague or Missing Triggers

**Problem**: `Trigger: When using React` (too broad)
**Instead**: `Trigger: When writing React 18 components/hooks in .tsx (Vite, React Router)` (specific)

### Anti-Pattern 3: Overloaded Skills

**Problem**: Single skill trying to cover testing, deployment, AND monitoring
**Instead**: Create separate focused skills: `myapp-test`, `myapp-deploy`, `myapp-monitor`

### Anti-Pattern 4: Missing `auto_invoke`

**Problem**: Skills that should be auto-invoked but lack the metadata
**Instead**: Always add `metadata.auto_invoke` with clear action description

### Anti-Pattern 5: Generic Names

**Problem**: `utils`, `helpers`, `common` (meaningless)
**Instead**: `typescript-types`, `api-client`, `error-handling` (descriptive)

### Anti-Pattern 6: Toy Examples

**Problem**: Code examples with `foo`, `bar`, `example1`
**Instead**: Real-world patterns with actual domain names and realistic use cases

### Anti-Pattern 7: No "Why" Explanations

**Problem**: Just showing code without explaining reasoning
**Instead**: Add "**Why:**" after critical patterns to explain the rationale

### Anti-Pattern 8: Forgetting `allowed-tools`

**Problem**: Skills that need specific tools but don't declare them
**Instead**: Always specify `allowed-tools` in frontmatter

### Anti-Pattern 9: Web URLs in References

**Problem**: Linking to external websites that may change
**Instead**: Use local paths (`docs/developer-guide/*.mdx`) or copy essential info

### Anti-Pattern 10: Skipping Sync Command

**Problem**: Creating skill but forgetting to synchronize the project
**Instead**: Always run `synapsync sync` after creating a new skill to update symlinks for all providers

---

## Skill Structure

```
.synapsync/skills/{category}/{skill-name}/
├── SKILL.md              # Required - main skill file
├── assets/               # Optional - templates, schemas, examples
│   ├── template.py
│   └── schema.json
└── references/           # Optional - links to local docs
    └── docs.md           # Points to project docs
```

---

## Categories

| Category       | Purpose                                     |
| -------------- | ------------------------------------------- |
| `general`      | General-purpose skills, internal AI tooling |
| `frontend`     | UI, React, CSS, components                  |
| `backend`      | APIs, servers, backend services             |
| `database`     | Database queries, migrations, ORMs          |
| `devops`       | CI/CD, infrastructure, deployment           |
| `security`     | Security analysis, vulnerability scanning   |
| `testing`      | Testing strategies, QA automation           |
| `analytics`    | Data analysis, research, benchmarking       |
| `automation`   | Task automation, workflows                  |
| `integrations` | External services (Supabase, Stripe, etc.)  |

---

## SKILL.md Templates

> **Available Templates:**
>
> - **Basic Template**: [assets/SKILL-TEMPLATE-BASIC.md](assets/SKILL-TEMPLATE-BASIC.md) - For simple, single-purpose skills
> - **Advanced Template**: [assets/SKILL-TEMPLATE-ADVANCED.md](assets/SKILL-TEMPLATE-ADVANCED.md) - For complex skills with workflows
>
> **When creating a new skill, use the appropriate template as your starting point.**

### Basic Template (Simple Skills)

**Use for:** Single-purpose skills without workflows, integrations, or complex configurations

**File:** [assets/SKILL-TEMPLATE-BASIC.md](assets/SKILL-TEMPLATE-BASIC.md)

````markdown
---
name: { skill-name }
description: >
  {One-line description of what this skill does}.
  Trigger: {When the AI should load this skill}.
license: Apache-2.0
metadata:
  author: synapsync
  version: "1.0"
  scope: [root]
  auto_invoke: "{Action that triggers this skill}"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Purpose

{One clear sentence explaining the skill's goal}

## When to Use This Skill

- {Concrete use case 1}
- {Concrete use case 2}
- {Concrete use case 3}

## Critical Patterns

{The most important rules - what AI MUST know}

## Code Examples

```{language}
{Minimal, focused examples with comments}
```
````

## Commands

```bash
{Common commands with descriptions}
```

## Resources

- **Templates**: See [assets/](assets/) for {description}
- **Documentation**: See [references/](references/) for local docs

````

### Advanced Template (Complex Skills)

**Use for:** Skills with workflows, reports, integrations, or safety concerns

**File:** [assets/SKILL-TEMPLATE-ADVANCED.md](assets/SKILL-TEMPLATE-ADVANCED.md)

```markdown
---
name: {skill-name}
description: >
  {One-line description of what this skill does}.
  Trigger: {When the AI should load this skill}.
license: Apache-2.0
metadata:
  author: synapsync
  version: "1.0"
  scope: [root]
  auto_invoke: "{Action that triggers this skill}"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
---

## Purpose
{One clear sentence explaining the skill's goal}

## When to Use This Skill
- {Concrete use case 1}
- {Concrete use case 2}
- {Concrete use case 3}

## Capabilities
{Detailed breakdown of what this skill can do}

### Category 1
- Capability A
- Capability B

### Category 2
- Capability C
- Capability D

## Supported Languages/Frameworks (if applicable)
### Primary Support
- **Technology 1**: Specific versions or variants
- **Technology 2**: Specific versions or variants

### Analysis/Implementation Techniques
- Technique 1
- Technique 2

## Workflow (for multi-step processes)

### Step 1: {Phase Name}
{Description of what happens in this phase}

### Step 2: {Phase Name}
{Description of what happens in this phase}

### Step 3: {Phase Name}
{Description of what happens in this phase}

## Command Examples

### Basic Usage
```bash
{Simple command example}
````

### Targeted Usage

```bash
{More specific command example}
```

### Advanced Options

```bash
{Complex command with options}
```

## Configuration Options (if applicable)

### {Option Category 1}

- Option A: Description
- Option B: Description

### {Option Category 2}

- High (>90%): {description}
- Medium (70-90%): {description}
- Low (<70%): {description}

## Output Structure (if skill produces artifacts)

### Report/File Sections

1. **Section 1**: What it contains
2. **Section 2**: What it contains
3. **Section 3**: What it contains

## Critical Patterns

{The most important rules - what AI MUST know}

## Code Examples

```{language}
{Minimal, focused examples with comments}
```

## Best Practices

### Before Running

1. {Preparation step 1}
2. {Preparation step 2}

### During Execution

1. {Execution guideline 1}
2. {Execution guideline 2}

### After Completion

1. {Post-execution step 1}
2. {Post-execution step 2}

## Integration with Other Skills (if applicable)

### With `{skill-name}`

- {Integration point or use case}

### With `{skill-name}`

- {Integration point or use case}

## Limitations

1. **{Limitation Category}**: {Description of what cannot be done}
2. **{Limitation Category}**: {Description of what cannot be done}

## Safety Features (for destructive operations)

- **{Safety Feature 1}**: {Description}
- **{Safety Feature 2}**: {Description}
- **{Safety Feature 3}**: {Description}

## Troubleshooting

### Issue: "{Common Problem}"

**Solution**: {How to fix it}

### Issue: "{Common Problem}"

**Solution**: {How to fix it}

## Example Output (if applicable)

```{format}
{Realistic example of what the skill produces}
```

## Version History

- **1.0** (YYYY-MM-DD): Initial release

## Future Enhancements

- [ ] {Planned improvement 1}
- [ ] {Planned improvement 2}

```

---

## Naming Conventions

| Type | Pattern | Examples |
|------|---------|----------|
| Generic skill | `{technology}` | `pytest`, `playwright`, `typescript` |
| Project-specific | `{project}-{component}` | `myapp-api`, `myapp-ui`, `myapp-checks` |
| Testing skill | `{project}-test-{component}` | `myapp-test-api`, `myapp-test-ui` |
| Workflow skill | `{action}-{target}` | `skill-creator`, `jira-task` |

---

## Decision: assets/ vs references/

```

Need code templates? → assets/
Need JSON schemas? → assets/
Need example configs? → assets/
Link to existing docs? → references/
Link to external guides? → references/ (with local path)

```

**Key Rule**: `references/` should point to LOCAL files (`docs/developer-guide/*.mdx`), not web URLs.

---

## Decision: Project-Specific vs Generic

```

Patterns apply to ANY project? → Generic skill (e.g., pytest, typescript)
Patterns are project-specific? → {project}-{name} skill
Generic skill needs project info? → Add references/ pointing to project docs

```

---

## Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Skill identifier (lowercase, hyphens) |
| `description` | Yes | What + Trigger in one block |
| `license` | Yes | License identifier (e.g., `Apache-2.0`, `MIT`) |
| `metadata.author` | Yes | Author or organization name |
| `metadata.version` | Yes | Semantic version as string |

---

## Template Selection Guide

```

Simple, single-purpose skill? → Use Basic Template
Complex workflow with multiple steps? → Use Advanced Template
Skill produces reports/files? → Use Advanced Template
Skill has safety concerns? → Use Advanced Template
Skill integrates with other skills? → Use Advanced Template

````

---

## Template Guidelines

When generating a new skill, include sections based on complexity:

### Core Sections (Always Include)
1. **Purpose**: One clear sentence explaining the skill's goal
2. **When to Use This Skill**: 3-5 concrete use cases
3. **Critical Patterns**: The most important rules AI must know
4. **Code Examples**: At least 1-2 focused examples
5. **Commands**: Copy-paste ready commands with descriptions

### Optional Sections (Include if Relevant)
- **Capabilities**: For skills with multiple features (break into categories)
- **Workflow**: For multi-step processes (numbered steps)
- **Command Examples**: Multiple complexity levels (Basic/Targeted/Advanced)
- **Configuration Options**: For configurable skills (group by category)
- **Supported Languages/Frameworks**: For language-specific skills
- **Output Structure**: For skills that generate reports/files
- **Best Practices**: Pre/during/post execution guidance (phased approach)
- **Integration with Other Skills**: How this skill works with existing skills
- **Limitations**: Be transparent about what the skill cannot do
- **Safety Features**: For destructive operations (explicit safeguards)
- **Troubleshooting**: Common issues and solutions (FAQ format)
- **Example Output**: Show realistic output (with proper formatting)
- **Version History**: Track evolution over time
- **Future Enhancements**: Planned improvements (checkbox format)

---

## Style Guidelines

### Visual Hierarchy
- Use emojis sparingly for visual scanning
- Use bold for emphasis on key terms
- Use tables for comparisons and decision trees
- Use code fences with language identifiers

### Writing Style
- Start sections with action verbs
- Use present tense for descriptions
- Be concise but complete
- Include "why" not just "what"

### Code Examples
- Include language identifier in code fences
- Add inline comments to explain non-obvious parts
- Show both correct and incorrect patterns when helpful
- Keep examples realistic and production-like

### Confidence Levels (for recommendations)
- **High (>90%)**: Safe to execute
- **Medium (70-90%)**: Review recommended
- **Low (<70%)**: Manual investigation required

### Command Format
```bash
# Description of what this command does
command --flag argument
````

---

## Content Guidelines

### DO

- Start with the most critical patterns (priority-first)
- Use tables for decision trees and comparisons
- Keep code examples minimal and focused
- Include Commands section with copy-paste commands
- Show realistic examples (not toy examples)
- Include confidence levels for recommendations
- Use phased approaches (Before/During/After)
- Be transparent about limitations
- Show integration points with other skills
- Include troubleshooting for common issues

### DON'T

- Add Keywords section (agent searches frontmatter, not body)
- Duplicate content from existing docs (reference instead)
- Include lengthy explanations (link to docs)
- Use generic/toy examples (show real-world patterns)
- Use web URLs in references (use local paths)
- Make skills too broad (keep focused)
- Skip the "Purpose" section (always required)
- Forget to include "allowed-tools" in frontmatter

---

## Syncing the Project After Skill Creation

After creating a new skill, you should synchronize the project to make it available to AI assistants across all enabled providers.

### How to Sync

Run the CLI sync command:

```bash
synapsync sync
```

### What This Does

The sync command performs a **double synchronization**:

**1. Manifest Sync**

- Scans `.synapsync/` filesystem for all cognitives
- Compares with `manifest.json` (the registry of installed cognitives)
- Adds new cognitives (created locally by AI) with `source: "local"`
- Removes entries for deleted cognitives
- Updates `manifest.json`

**2. Provider Sync**

- For each enabled provider (claude, cursor, etc.):
  - Creates symlinks from provider directory to central storage
  - Example: `.claude/skills/react-hooks` → `../../.synapsync/skills/frontend/react-hooks`
  - Removes orphaned symlinks (cognitive no longer exists)

### Directory Structure After Sync

```
project/
├── .synapsync/                          # Central storage (source of truth)
│   ├── manifest.json                    # Registry of all cognitives
│   └── skills/
│       └── frontend/
│           └── react-hooks/
│               └── SKILL.md             # The actual skill file
│
├── .claude/                             # Claude provider (symlinks)
│   └── skills/
│       └── react-hooks -> ../../.synapsync/skills/frontend/react-hooks
│
└── .cursor/                             # Cursor provider (symlinks)
    └── skills/
        └── react-hooks -> ../../.synapsync/skills/frontend/react-hooks
```

### No Manual Copying Required

You do NOT need to manually copy skills to each provider folder. The CLI creates symlinks from each provider's skills directory back to the central `.synapsync/skills/` folder.

> **IMPORTANT**: Always run `synapsync sync` after creating, modifying, or deleting skills to keep your project synchronized with all providers.

---

## Real-World Examples

### Example 1: Simple Skill (Basic Template)

**Skill**: `typescript-types`
**Structure**:

- Purpose
- When to Use This Skill
- Critical Patterns
- Code Examples
- Commands

**Why Basic Template**: Single-purpose, no workflow, no integrations needed.

---

### Example 2: Complex Skill (Advanced Template)

**Skill**: `dead-code-hunter`
**Structure**:

- Purpose
- When to Use This Skill
- Capabilities (with categories)
- Supported Languages & Frameworks
- Workflow (4 steps)
- Command Examples (Basic/Targeted/Advanced)
- Configuration Options
- Output Structure
- Best Practices (Before/During/After)
- Integration with Other Skills
- Limitations
- Safety Features
- Troubleshooting
- Example Output
- Version History

**Why Advanced Template**: Multi-step workflow, produces reports, has safety concerns, integrates with other skills.

---

## Decision Trees

### Should This Be a Skill?

```
Is pattern used repeatedly?
├─ No → Don't create skill
└─ Yes
   └─ Is it project-specific or generic?
      ├─ Generic → Create generic skill (e.g., `pytest`)
      └─ Project-specific
         └─ Does existing documentation cover it?
            ├─ Yes → Create reference instead
            └─ No → Create {project}-{component} skill
```

### Which Template Should I Use?

```
Does skill have multiple steps?
├─ Yes → Advanced Template
└─ No
   └─ Does skill produce files/reports?
      ├─ Yes → Advanced Template
      └─ No
         └─ Does skill have safety concerns?
            ├─ Yes → Advanced Template
            └─ No → Basic Template
```

### Which Sections Should I Include?

```
Core sections (always):
- Purpose
- When to Use This Skill
- Critical Patterns
- Code Examples
- Commands

Optional sections (add if relevant):
- Capabilities → If skill has multiple features
- Workflow → If skill has multi-step process
- Command Examples (multiple levels) → If skill has varying complexity
- Configuration Options → If skill is configurable
- Supported Languages → If skill is language-specific
- Output Structure → If skill produces artifacts
- Best Practices → If skill has phases (Before/During/After)
- Integration with Other Skills → If skill composes with others
- Limitations → If skill has known constraints
- Safety Features → If skill can cause data loss/changes
- Troubleshooting → If skill has common issues
- Example Output → If output format matters
```

---

## Checklist Before Creating

- [ ] Skill doesn't already exist (check `.synapsync/skills/`)
- [ ] Pattern is reusable (not one-off)
- [ ] Name follows conventions (lowercase, hyphens)
- [ ] Category is correct (general/frontend/backend/devops/security/testing/etc.)
- [ ] Template selected (Basic vs Advanced)
- [ ] Frontmatter is complete:
  - [ ] `name` field
  - [ ] `description` with trigger keywords
  - [ ] `license` field
  - [ ] `metadata.author` field
  - [ ] `metadata.version` field
  - [ ] `metadata.scope` field (usually `[root]`)
  - [ ] `metadata.auto_invoke` field (if applicable)
  - [ ] `allowed-tools` field
- [ ] Core sections included:
  - [ ] Purpose
  - [ ] When to Use This Skill
  - [ ] Critical Patterns
  - [ ] Code Examples
  - [ ] Commands
- [ ] Optional sections (if applicable):
  - [ ] Capabilities
  - [ ] Workflow
  - [ ] Configuration Options
  - [ ] Best Practices
  - [ ] Limitations
  - [ ] Troubleshooting
- [ ] Code examples are realistic (not toy examples)
- [ ] Commands are copy-paste ready
- [ ] No web URLs in references (local paths only)
- [ ] Run `synapsync sync` after creation

## Resources

### Templates

- **Basic Template**: [assets/SKILL-TEMPLATE-BASIC.md](assets/SKILL-TEMPLATE-BASIC.md) - For simple skills
- **Advanced Template**: [assets/SKILL-TEMPLATE-ADVANCED.md](assets/SKILL-TEMPLATE-ADVANCED.md) - For complex skills

### References

- **Examples**: Review existing skills in `.synapsync/skills/` for reference patterns
- **SynapSync Registry**: https://github.com/SynapSync/synapse-registry - Public skill repository
