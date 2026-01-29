/**
 * Version tests
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { version } from '../../src/version.js';

describe('version', () => {
  it('should be a valid semver string', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should match package.json version', () => {
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf-8'));
    expect(version).toBe(pkg.version);
  });
});
