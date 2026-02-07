/**
 * REPL Dispatcher Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockShowError, mockLogger } = vi.hoisted(() => ({
  mockShowError: vi.fn(),
  mockLogger: {
    log: vi.fn(),
    line: vi.fn(),
    error: vi.fn(),
    hint: vi.fn(),
    bold: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    dim: vi.fn(),
    clear: vi.fn(),
    label: vi.fn(),
  },
}));

vi.mock('../../../src/ui/banner.js', () => ({
  showError: mockShowError,
  showBanner: vi.fn(),
  showInfo: vi.fn(),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

// Must import after mocks
import { COMMANDS } from '../../../src/ui/repl/registry.js';
import { executeCommand } from '../../../src/ui/repl/dispatcher.js';

describe('executeCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear any registered commands
    for (const key of Object.keys(COMMANDS)) {
      delete COMMANDS[key];
    }
  });

  it('should do nothing for empty input', async () => {
    await executeCommand('');
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it('should do nothing for whitespace-only input', async () => {
    await executeCommand('   ');
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it('should show error for input without / prefix', async () => {
    await executeCommand('help');
    expect(mockShowError).toHaveBeenCalledWith(expect.stringContaining('Commands must start with /'));
  });

  it('should do nothing for bare /', async () => {
    await executeCommand('/');
    expect(mockShowError).not.toHaveBeenCalled();
  });

  it('should show error for unknown command', async () => {
    await executeCommand('/nonexistent');
    expect(mockShowError).toHaveBeenCalledWith(expect.stringContaining('/nonexistent'));
  });

  it('should execute a registered command', async () => {
    const handler = vi.fn();
    COMMANDS['test'] = { description: 'test', handler };

    await executeCommand('/test');
    expect(handler).toHaveBeenCalledWith('');
  });

  it('should pass arguments to the handler', async () => {
    const handler = vi.fn();
    COMMANDS['test'] = { description: 'test', handler };

    await executeCommand('/test --flag value');
    expect(handler).toHaveBeenCalledWith('--flag value');
  });

  it('should handle command names case-insensitively', async () => {
    const handler = vi.fn();
    COMMANDS['test'] = { description: 'test', handler };

    await executeCommand('/TEST');
    expect(handler).toHaveBeenCalledWith('');
  });

  it('should catch and display handler errors', async () => {
    const handler = vi.fn().mockRejectedValue(new Error('handler failed'));
    COMMANDS['test'] = { description: 'test', handler };

    await executeCommand('/test');
    expect(mockShowError).toHaveBeenCalledWith('handler failed');
  });

  it('should handle non-Error throws', async () => {
    const handler = vi.fn().mockRejectedValue('string error');
    COMMANDS['test'] = { description: 'test', handler };

    await executeCommand('/test');
    expect(mockShowError).toHaveBeenCalledWith('An unexpected error occurred');
  });

  it('should handle async handlers', async () => {
    const handler = vi.fn().mockResolvedValue(undefined);
    COMMANDS['async'] = { description: 'async test', handler };

    await executeCommand('/async arg1 arg2');
    expect(handler).toHaveBeenCalledWith('arg1 arg2');
  });
});
