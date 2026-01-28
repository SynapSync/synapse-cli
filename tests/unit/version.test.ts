/**
 * Version tests
 */

import { describe, it, expect } from 'vitest';
import { version } from '../../src/version.js';

describe('version', () => {
  it('should be a valid semver string', () => {
    expect(version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('should be 0.1.0 initially', () => {
    expect(version).toBe('0.1.0');
  });
});
