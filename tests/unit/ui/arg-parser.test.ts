/**
 * Argument Parser Tests
 */

import { describe, it, expect } from 'vitest';
import { parseArgs } from '../../../src/ui/repl/arg-parser.js';
import type { FlagDef } from '../../../src/ui/repl/types.js';

describe('parseArgs', () => {
  const standardFlags: FlagDef[] = [
    { flags: ['--type', '-t'], key: 'type', type: 'string' },
    { flags: ['--force', '-f'], key: 'force', type: 'boolean' },
    { flags: ['--verbose', '-v'], key: 'verbose', type: 'boolean' },
    { flags: ['--category', '-c'], key: 'category', type: 'string' },
  ];

  describe('empty/blank input', () => {
    it('should return empty results for empty string', () => {
      const result = parseArgs('', standardFlags);
      expect(result.positional).toEqual([]);
      expect(result.options).toEqual({});
    });

    it('should return empty results for whitespace-only string', () => {
      const result = parseArgs('   ', standardFlags);
      expect(result.positional).toEqual([]);
      expect(result.options).toEqual({});
    });
  });

  describe('positional arguments', () => {
    it('should collect single positional argument', () => {
      const result = parseArgs('my-skill', standardFlags);
      expect(result.positional).toEqual(['my-skill']);
    });

    it('should collect multiple positional arguments', () => {
      const result = parseArgs('first second third', standardFlags);
      expect(result.positional).toEqual(['first', 'second', 'third']);
    });

    it('should handle positional arguments mixed with flags', () => {
      const result = parseArgs('my-skill --force other', standardFlags);
      expect(result.positional).toEqual(['my-skill', 'other']);
      expect(result.options).toEqual({ force: true });
    });
  });

  describe('boolean flags', () => {
    it('should parse long boolean flag', () => {
      const result = parseArgs('--force', standardFlags);
      expect(result.options['force']).toBe(true);
    });

    it('should parse short boolean flag', () => {
      const result = parseArgs('-f', standardFlags);
      expect(result.options['force']).toBe(true);
    });

    it('should parse multiple boolean flags', () => {
      const result = parseArgs('--force --verbose', standardFlags);
      expect(result.options['force']).toBe(true);
      expect(result.options['verbose']).toBe(true);
    });
  });

  describe('string flags', () => {
    it('should parse long string flag with value', () => {
      const result = parseArgs('--type skill', standardFlags);
      expect(result.options['type']).toBe('skill');
    });

    it('should parse short string flag with value', () => {
      const result = parseArgs('-t agent', standardFlags);
      expect(result.options['type']).toBe('agent');
    });

    it('should handle missing value for string flag', () => {
      const result = parseArgs('--type', standardFlags);
      expect(result.options['type']).toBe('');
    });

    it('should parse multiple string flags', () => {
      const result = parseArgs('--type skill --category planning', standardFlags);
      expect(result.options['type']).toBe('skill');
      expect(result.options['category']).toBe('planning');
    });
  });

  describe('mixed arguments', () => {
    it('should handle positional + boolean + string flags', () => {
      const result = parseArgs('my-skill --force --type agent', standardFlags);
      expect(result.positional).toEqual(['my-skill']);
      expect(result.options['force']).toBe(true);
      expect(result.options['type']).toBe('agent');
    });

    it('should handle flags before positional', () => {
      const result = parseArgs('--force my-skill', standardFlags);
      expect(result.positional).toEqual(['my-skill']);
      expect(result.options['force']).toBe(true);
    });

    it('should handle short flags mixed with positional', () => {
      const result = parseArgs('-t skill my-name -f', standardFlags);
      expect(result.positional).toEqual(['my-name']);
      expect(result.options['type']).toBe('skill');
      expect(result.options['force']).toBe(true);
    });
  });

  describe('unknown flags', () => {
    it('should ignore unknown flags starting with --', () => {
      const result = parseArgs('--unknown value', standardFlags);
      expect(result.positional).toEqual(['value']);
      expect(result.options).toEqual({});
    });

    it('should ignore unknown short flags', () => {
      const result = parseArgs('-x', standardFlags);
      expect(result.positional).toEqual([]);
      expect(result.options).toEqual({});
    });
  });

  describe('no flag definitions', () => {
    it('should treat everything as positional with empty flag defs', () => {
      const result = parseArgs('hello world', []);
      expect(result.positional).toEqual(['hello', 'world']);
    });
  });

  describe('extra whitespace', () => {
    it('should handle multiple spaces between arguments', () => {
      const result = parseArgs('my-skill   --force   --type   skill', standardFlags);
      expect(result.positional).toEqual(['my-skill']);
      expect(result.options['force']).toBe(true);
      expect(result.options['type']).toBe('skill');
    });
  });

  describe('real-world command patterns', () => {
    it('should parse /add style args', () => {
      const addFlags: FlagDef[] = [
        { flags: ['--type', '-t'], key: 'type', type: 'string' },
        { flags: ['--category', '-c'], key: 'category', type: 'string' },
        { flags: ['--force', '-f'], key: 'force', type: 'boolean' },
      ];
      const result = parseArgs('skill-creator --force --category frontend', addFlags);
      expect(result.positional).toEqual(['skill-creator']);
      expect(result.options['force']).toBe(true);
      expect(result.options['category']).toBe('frontend');
    });

    it('should parse /sync style args with subcommand', () => {
      const syncFlags: FlagDef[] = [
        { flags: ['--dry-run', '-n'], key: 'dryRun', type: 'boolean' },
        { flags: ['--provider', '-p'], key: 'provider', type: 'string' },
        { flags: ['--json'], key: 'json', type: 'boolean' },
      ];
      const result = parseArgs('status --json', syncFlags);
      expect(result.positional).toEqual(['status']);
      expect(result.options['json']).toBe(true);
    });

    it('should parse /list style args (no positional)', () => {
      const listFlags: FlagDef[] = [
        { flags: ['--remote', '-r'], key: 'remote', type: 'boolean' },
        { flags: ['--category', '-c'], key: 'category', type: 'string' },
      ];
      const result = parseArgs('--remote --category planning', listFlags);
      expect(result.positional).toEqual([]);
      expect(result.options['remote']).toBe(true);
      expect(result.options['category']).toBe('planning');
    });
  });
});
