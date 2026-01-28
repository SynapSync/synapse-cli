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
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
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

## Capabilities
{Detailed breakdown of what this skill can do - OPTIONAL: Remove if not applicable}

### Category 1
- Capability A
- Capability B

### Category 2
- Capability C
- Capability D

---

## Supported Languages/Frameworks
{OPTIONAL: Remove if not applicable}

### Primary Support
- **Technology 1**: Specific versions or variants
- **Technology 2**: Specific versions or variants

### Analysis/Implementation Techniques
- Technique 1
- Technique 2

---

## Workflow
{OPTIONAL: For multi-step processes - Remove if not applicable}

### Step 1: {Phase Name}
{Description of what happens in this phase}

### Step 2: {Phase Name}
{Description of what happens in this phase}

### Step 3: {Phase Name}
{Description of what happens in this phase}

---

## Critical Patterns
{The MOST important rules - what AI MUST follow}

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

## Command Examples
{OPTIONAL: Use this section for skills with varying command complexity}

### Basic Usage
```bash
# {Description}
{simple command example}
```

### Targeted Usage
```bash
# {Description}
{more specific command example}
```

### Advanced Options
```bash
# {Description}
{complex command with options}
```

---

## Configuration Options
{OPTIONAL: For configurable skills - Remove if not applicable}

### {Option Category 1}
- Option A: Description
- Option B: Description

### {Option Category 2}
- High (>90%): {description}
- Medium (70-90%): {description}
- Low (<70%): {description}

---

## Output Structure
{OPTIONAL: For skills that produce artifacts - Remove if not applicable}

### Report/File Sections
1. **Section 1**: What it contains
2. **Section 2**: What it contains
3. **Section 3**: What it contains

---

## Best Practices
{OPTIONAL: For skills with phases - Remove if not applicable}

### Before Running
1. {Preparation step 1}
2. {Preparation step 2}

### During Execution
1. {Execution guideline 1}
2. {Execution guideline 2}

### After Completion
1. {Post-execution step 1}
2. {Post-execution step 2}

---

## Integration with Other Skills
{OPTIONAL: Remove if not applicable}

### With `{skill-name}`
- {Integration point or use case}

### With `{skill-name}`
- {Integration point or use case}

---

## Limitations
{OPTIONAL: Be transparent - Remove if not applicable}

1. **{Limitation Category}**: {Description of what cannot be done}
2. **{Limitation Category}**: {Description of what cannot be done}

---

## Safety Features
{OPTIONAL: For destructive operations - Remove if not applicable}

- **{Safety Feature 1}**: {Description}
- **{Safety Feature 2}**: {Description}
- **{Safety Feature 3}**: {Description}

---

## Troubleshooting
{OPTIONAL: For skills with common issues - Remove if not applicable}

### Issue: "{Common Problem}"
**Solution**: {How to fix it}

### Issue: "{Common Problem}"
**Solution**: {How to fix it}

---

## Example Output
{OPTIONAL: For skills with specific output formats - Remove if not applicable}

```{format}
{Realistic example of what the skill produces}
```

---

## Resources

- **Templates**: See [assets/](assets/) for {description of templates}
- **Documentation**: See [references/](references/) for local developer guide links
- **External**: [Link text](URL) - {Brief description}

---

## Version History
{OPTIONAL: Track evolution - Remove if not applicable}

- **1.0** (YYYY-MM-DD): Initial release

---

## Future Enhancements
{OPTIONAL: Planned improvements - Remove if not applicable}

- [ ] {Planned improvement 1}
- [ ] {Planned improvement 2}
