# Pending GitHub Issues

These issues need to be created manually after the repo is public.

---

## Issue 1: Register more commands

**Title:** `[TODO] Register more commands as they are implemented`

**Labels:** `enhancement`

**Body:**
```
**Location:** `src/cli.ts:63`

**Current code:**
```typescript
// TODO: Register more commands as they are implemented
```

**Context:** This was a placeholder during initial development. Most commands have been registered.

**Action:** Review if there are any missing commands that should be added, then remove the TODO comment.
```

---

## Issue 2: Check actual provider connection status

**Title:** `[TODO] Check actual provider connection status`

**Labels:** `enhancement`

**Body:**
```
**Location:** `src/commands/status.ts:164`

**Current code:**
```typescript
connected: false, // TODO: Check actual connection status
```

**Context:** The status command shows provider connection status, but currently hardcodes `connected: false`.

**Action:** Implement actual connection checking for providers (may require API keys or ping endpoints).
```

---

## Issue 3: Implement actual registry lookup in detector

**Title:** `[TODO] Implement actual registry lookup in detector`

**Labels:** `enhancement`

**Body:**
```
**Location:** `src/services/cognitive/detector.ts:160`

**Current code:**
```typescript
// TODO: Implement actual registry lookup
```

**Context:** The cognitive detector has a placeholder for looking up cognitives in the registry.

**Action:** Implement registry lookup to validate cognitive sources against the public registry.
```

---

After creating these issues, delete this file.
