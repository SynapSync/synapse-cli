---
name: plan-executor
description: >
  Executes project plans by reading documentation from docs/ folder and managing phased workflows with TODO tracking.
  Trigger: When user says "start to work in plan [name]", "execute plan [name]", "begin phase [X]", "continue plan", or asks about plan progress.
license: Apache-2.0
metadata:
  author: growthly-skills-cli
  version: "1.0"
  scope: [root]
  auto_invoke: "when user mentions working on a plan, starting a phase, or asks about plan/phase progress"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Task
---

## Purpose

Execute project plans by reading structured documentation from `docs/` folder, managing phased workflows with TODO tracking, and ensuring technical decisions align with documented specifications.

## When to Use This Skill

- User says "start to work in plan [name]"
- User says "begin phase [X]" or "continue with phase [X]"
- User asks "what's the status of plan [name]?"
- User needs technical guidance during plan execution
- User wants to review completed tasks or pending TODOs

## Docs Folder Structure

Expect documentation in `docs/` with this structure:

```
docs/
├── plans/
│   ├── plan-[name].md          # Main plan definition
│   └── ...
├── technical/
│   ├── architecture.md         # Architecture decisions
│   ├── api-specs.md            # API specifications
│   └── ...
└── requirements/
    ├── features.md             # Feature requirements
    └── ...
```

## Plan Document Format

Each plan file (`docs/plans/plan-[name].md`) should follow this structure:

```markdown
# Plan: [Name]

## Overview

[Brief description of what this plan accomplishes]

## Phases

### Phase 1: [Phase Name]

**Objective**: [What this phase achieves]
**Dependencies**: [Prerequisites or previous phases]

#### Tasks

- [ ] Task 1 description
- [ ] Task 2 description

#### Technical References

- See `docs/technical/[relevant-file].md` for [topic]

### Phase 2: [Phase Name]

...
```

## Workflow

### Step 1: Plan Discovery

When user triggers plan execution:

1. Read `docs/plans/` to list available plans
2. If plan name provided, load `docs/plans/plan-[name].md`
3. Parse phases and tasks from the plan document
4. Display plan overview and available phases

```bash
# Discover available plans
ls docs/plans/

# Read specific plan
cat docs/plans/plan-[name].md
```

### Step 2: Phase Initialization

When starting a phase:

1. Extract phase details from plan document
2. Generate TODO checklist for the phase
3. Identify technical references needed
4. Load relevant docs from `docs/technical/` or `docs/requirements/`

**Output format for phase start:**

```markdown
## 📋 Phase [X]: [Phase Name]

**Objective**: [Phase objective]

### TODO Checklist

- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Technical References Loaded

- `docs/technical/[file].md` - [Brief description]

### Ready to Begin

Confirm to start working on this phase.
```

### Step 3: Task Execution

For each task in the phase:

1. Check `docs/` for technical specifications before implementing
2. Execute the task following documented patterns
3. Update TODO status as tasks complete
4. Report progress after each task

**Progress update format:**

```markdown
### ✅ Task Completed: [Task Name]

**What was done**: [Brief summary]
**Files modified**: [List of files]

### Updated TODO

- [x] Completed task 1
- [x] Completed task 2
- [ ] Pending task 3
```

### Step 4: Phase Completion

When all tasks in a phase are done:

1. Generate phase completion summary
2. List any blockers or notes for next phase
3. Suggest next phase if available

## Critical Patterns

### Always Read Docs First

Before implementing ANY task, search relevant docs:

```bash
# Search for technical guidance
grep -r "[keyword]" docs/technical/
grep -r "[keyword]" docs/requirements/

# Read specific documentation
cat docs/technical/[relevant-file].md
```

### TODO Tracking Format

Maintain consistent TODO format throughout execution:

```markdown
### Phase [X] TODO

#### Completed

- [x] Task description - completed [timestamp]

#### In Progress

- [ ] 🔄 Task description - started [timestamp]

#### Pending

- [ ] Task description
```

### Technical Decision Validation

When making technical decisions:

1. Search docs for existing decisions: `grep -r "[topic]" docs/`
2. If documented, follow the specification
3. If not documented, propose and confirm with user before proceeding

## Command Examples

### Start a Plan

```bash
# User says: "start to work in plan authentication"
# AI executes:
cat docs/plans/plan-authentication.md
```

### Check Technical Specs

```bash
# Before implementing a feature
grep -r "authentication" docs/technical/
cat docs/technical/auth-flow.md
```

### List All Plans

```bash
ls -la docs/plans/
```

## Best Practices

### Before Starting a Phase

1. Read the entire phase section from the plan document
2. Load ALL referenced technical docs
3. Confirm understanding with user before coding

### During Execution

1. Update TODO after EACH completed task
2. Reference docs for ANY technical question
3. Ask user if docs don't cover a specific case

### After Phase Completion

1. Summarize what was accomplished
2. Note any deviations from the plan
3. Identify blockers for next phase

## Integration with Other Skills

### With `task-planner`

- Use task-planner to create new plans in `docs/plans/`
- plan-executor consumes these plans

### With `growth-architect`

- growth-architect defines architecture in `docs/technical/`
- plan-executor references these during implementation

## Limitations

1. **Docs must exist**: Skill requires `docs/` folder with proper structure
2. **Plan format**: Plans must follow the expected markdown format
3. **No auto-creation**: Does not create plans, only executes them

## Troubleshooting

### Issue: "Plan not found"

**Solution**: Check if `docs/plans/plan-[name].md` exists. List available plans with `ls docs/plans/`

### Issue: "Technical reference missing"

**Solution**: Create the missing doc in `docs/technical/` or `docs/requirements/` before proceeding

### Issue: "Phase tasks unclear"

**Solution**: Update the plan document with clearer task definitions before execution

## Example Interaction

**User**: "start to work in plan user-management"

**AI Response**:

```markdown
## 📋 Plan: User Management

### Overview

Implement user CRUD operations with role-based access control.

### Available Phases

1. **Phase 1: Database Schema** - Define user tables and relationships
2. **Phase 2: API Endpoints** - Create REST endpoints for user operations
3. **Phase 3: Authentication** - Implement login/logout flows
4. **Phase 4: Authorization** - Add role-based permissions

### Technical References Found

- `docs/technical/database-schema.md`
- `docs/technical/api-conventions.md`
- `docs/requirements/user-stories.md`

Which phase would you like to start?
```

**User**: "start phase 1"

**AI Response**:

```markdown
## 📋 Phase 1: Database Schema

**Objective**: Define user tables and relationships

### TODO Checklist

- [ ] Create users table migration
- [ ] Create roles table migration
- [ ] Create user_roles pivot table
- [ ] Add indexes for performance
- [ ] Write seed data for testing

### Technical References Loaded

- `docs/technical/database-schema.md` - Contains naming conventions and field types

Ready to begin. Shall I start with the first task?
```
