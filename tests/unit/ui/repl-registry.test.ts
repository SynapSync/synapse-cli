/**
 * REPL Registry Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { COMMANDS, registerInteractiveCommand } from '../../../src/ui/repl/registry.js';

describe('registerInteractiveCommand', () => {
  beforeEach(() => {
    // Clear all registered commands
    for (const key of Object.keys(COMMANDS)) {
      delete COMMANDS[key];
    }
  });

  it('should register a command with name and description', () => {
    const handler = vi.fn();
    registerInteractiveCommand('test', 'A test command', handler);

    expect(COMMANDS['test']).toBeDefined();
    expect(COMMANDS['test']?.description).toBe('A test command');
    expect(COMMANDS['test']?.handler).toBe(handler);
  });

  it('should register a command with usage', () => {
    registerInteractiveCommand('test', 'Test', vi.fn(), {
      usage: '/test [options]',
    });

    expect(COMMANDS['test']?.usage).toBe('/test [options]');
  });

  it('should register a command with options', () => {
    const options = [
      { flag: '--force', description: 'Force action' },
      { flag: '--verbose', description: 'Verbose output' },
    ];

    registerInteractiveCommand('test', 'Test', vi.fn(), { options });

    expect(COMMANDS['test']?.options).toEqual(options);
  });

  it('should register a command with examples', () => {
    const examples = ['/test --force', '/test --verbose'];

    registerInteractiveCommand('test', 'Test', vi.fn(), { examples });

    expect(COMMANDS['test']?.examples).toEqual(examples);
  });

  it('should register a command with all options', () => {
    const handler = vi.fn();
    registerInteractiveCommand('full', 'Full command', handler, {
      usage: '/full <arg>',
      options: [{ flag: '-f', description: 'Force' }],
      examples: ['/full my-arg'],
    });

    const cmd = COMMANDS['full'];
    expect(cmd?.description).toBe('Full command');
    expect(cmd?.handler).toBe(handler);
    expect(cmd?.usage).toBe('/full <arg>');
    expect(cmd?.options).toHaveLength(1);
    expect(cmd?.examples).toHaveLength(1);
  });

  it('should not set optional fields when not provided', () => {
    registerInteractiveCommand('minimal', 'Minimal', vi.fn());

    const cmd = COMMANDS['minimal'];
    expect(cmd?.usage).toBeUndefined();
    expect(cmd?.options).toBeUndefined();
    expect(cmd?.examples).toBeUndefined();
  });

  it('should overwrite existing command with same name', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    registerInteractiveCommand('test', 'First', handler1);
    registerInteractiveCommand('test', 'Second', handler2);

    expect(COMMANDS['test']?.description).toBe('Second');
    expect(COMMANDS['test']?.handler).toBe(handler2);
  });

  it('should execute the registered handler', () => {
    const handler = vi.fn();
    registerInteractiveCommand('test', 'Test', handler);

    COMMANDS['test']?.handler('some args');
    expect(handler).toHaveBeenCalledWith('some args');
  });
});
