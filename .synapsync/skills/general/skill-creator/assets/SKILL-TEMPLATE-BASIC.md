---
name: {skill-name}
description: >
  {One-line description of what this skill does}.
  Trigger: {When the AI should load this skill - be specific with actions/file types}.
license: Apache-2.0
metadata:
  author: synapsync
  version: "1.0"
  scope: [root]  # Options: root, ui, api, sdk, mcp_server
  auto_invoke: "{Action that triggers this skill}"  # Or list: ["Action 1", "Action 2"]
allowed-tools: Read, Edit, Write, Glob, Grep, Bash
---

## Purpose
{One clear sentence explaining the skill's goal}

## When to Use This Skill
- {Concrete use case 1}
- {Concrete use case 2}
- {Concrete use case 3}

**Don't use this skill when:**
- {Anti-pattern or wrong use case 1}
- {Anti-pattern or wrong use case 2}

---

## Critical Patterns
{The most important rules - what AI MUST know}

### Pattern 1: {Name}

```{language}
// ALWAYS: {Good practice description}
{good code example}

// NEVER: {Bad practice description}
{bad code example}
```

**Why:** {Brief explanation of the reasoning}

### Pattern 2: {Name}

```{language}
// ALWAYS: {Good practice description}
{good code example}

// NEVER: {Bad practice description}
{bad code example}
```

**Why:** {Brief explanation of the reasoning}

---

## Code Examples

### Example 1: {Description}

```{language}
{minimal, focused example with inline comments explaining key points}
```

### Example 2: {Description}

```{language}
{minimal, focused example with inline comments explaining key points}
```

---

## Commands

```bash
# {Description of what this command does}
{command 1}

# {Description of what this command does}
{command 2}

# {Description of what this command does}
{command 3}
```

---

## Resources

- **Templates**: See [assets/](assets/) for {description of templates}
- **Documentation**: See [references/](references/) for local developer guide links
- **External**: [Link text](URL) - {Brief description}
