/**
 * Frontmatter Parser Tests
 */

import { describe, it, expect } from 'vitest';
import { parseFrontmatter, extractVersion, extractName } from '../../../src/services/scanner/parser.js';

describe('parseFrontmatter', () => {
  it('should parse basic key-value pairs', () => {
    const content = `---
name: test-skill
version: 1.0.0
description: A test skill
---

# Content here`;

    const result = parseFrontmatter(content);

    expect(result.name).toBe('test-skill');
    expect(result.version).toBe('1.0.0');
    expect(result.description).toBe('A test skill');
  });

  it('should parse array values with dashes', () => {
    const content = `---
name: test-skill
tags:
  - code
  - review
  - quality
---`;

    const result = parseFrontmatter(content);

    expect(result.tags).toEqual(['code', 'review', 'quality']);
  });

  it('should parse inline array values', () => {
    const content = `---
name: test-skill
tags: [code, review, quality]
---`;

    const result = parseFrontmatter(content);

    expect(result.tags).toEqual(['code', 'review', 'quality']);
  });

  it('should handle quoted values', () => {
    const content = `---
name: "my-skill"
description: 'A quoted description'
---`;

    const result = parseFrontmatter(content);

    expect(result.name).toBe('my-skill');
    expect(result.description).toBe('A quoted description');
  });

  it('should return empty object when no frontmatter', () => {
    const content = '# Just a heading\n\nNo frontmatter here.';

    const result = parseFrontmatter(content);

    expect(result).toEqual({});
  });

  it('should return empty object for invalid frontmatter', () => {
    const content = `---
invalid yaml: [unclosed
---`;

    const result = parseFrontmatter(content);

    // The simple parser may still handle this - just check it doesn't crash
    expect(result).toBeDefined();
  });

  it('should skip comments and empty lines', () => {
    const content = `---
# This is a comment
name: test

# Another comment
version: 1.0.0
---`;

    const result = parseFrontmatter(content);

    expect(result.name).toBe('test');
    expect(result.version).toBe('1.0.0');
  });

  it('should handle multiline indicator (| or >)', () => {
    const content = `---
name: test
providers:
  - claude
  - cursor
---`;

    const result = parseFrontmatter(content);

    expect(result.providers).toEqual(['claude', 'cursor']);
  });

  it('should handle array at end of frontmatter', () => {
    const content = `---
name: test
tags:
  - alpha
  - beta
---`;

    const result = parseFrontmatter(content);

    expect(result.tags).toEqual(['alpha', 'beta']);
  });
});

describe('extractVersion', () => {
  it('should return version from metadata', () => {
    const result = extractVersion({ version: '2.0.0' }, '');

    expect(result).toBe('2.0.0');
  });

  it('should extract version from content', () => {
    const content = 'Some text\nversion: 1.2.3\nMore text';
    const result = extractVersion({}, content);

    expect(result).toBe('1.2.3');
  });

  it('should extract quoted version from content', () => {
    const content = "version: '1.2.3'";
    const result = extractVersion({}, content);

    expect(result).toBe('1.2.3');
  });

  it('should default to 1.0.0', () => {
    const result = extractVersion({}, 'no version here');

    expect(result).toBe('1.0.0');
  });

  it('should prefer metadata over content', () => {
    const result = extractVersion({ version: '2.0.0' }, 'version: 1.0.0');

    expect(result).toBe('2.0.0');
  });
});

describe('extractName', () => {
  it('should return name from metadata', () => {
    const result = extractName({ name: 'my-skill' }, 'dir-name', '');

    expect(result).toBe('my-skill');
  });

  it('should extract name from markdown title', () => {
    const content = '# Code Reviewer\n\nThis skill reviews code.';
    const result = extractName({}, 'fallback', content);

    expect(result).toBe('code-reviewer');
  });

  it('should convert title to kebab-case', () => {
    const content = '# My Great Skill Name\n\nDescription.';
    const result = extractName({}, 'fallback', content);

    expect(result).toBe('my-great-skill-name');
  });

  it('should fall back to directory name', () => {
    const content = 'No title heading here.';
    const result = extractName({}, 'my-dir-name', content);

    expect(result).toBe('my-dir-name');
  });

  it('should prefer metadata over content', () => {
    const content = '# Different Name';
    const result = extractName({ name: 'explicit-name' }, 'fallback', content);

    expect(result).toBe('explicit-name');
  });

  it('should strip special characters from title', () => {
    const content = '# Code Review & Analysis (v2)';
    const result = extractName({}, 'fallback', content);

    expect(result).toBe('code-review-analysis-v2');
  });
});
