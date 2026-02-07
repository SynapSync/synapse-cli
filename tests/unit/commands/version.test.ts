/**
 * Version Command Tests
 *
 * Tests the version-related functions exported from version.ts.
 * The command itself uses registerVersionCommand which needs Commander,
 * so we test the internal functions indirectly.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// We test the compareVersions and fetchLatestVersion functions
// by importing and testing the module's behavior through the registered command

const { mockLogger } = vi.hoisted(() => ({
  mockLogger: {
    log: vi.fn(),
    line: vi.fn(),
    error: vi.fn(),
    hint: vi.fn(),
    bold: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    label: vi.fn(),
    dim: vi.fn(),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

// Mock the version module
vi.mock('../../../src/version.js', () => ({
  version: '1.0.0',
}));

import { Command } from 'commander';
import { registerVersionCommand } from '../../../src/commands/version.js';

describe('registerVersionCommand', () => {
  let program: Command;

  beforeEach(() => {
    vi.clearAllMocks();
    program = new Command();
    program.exitOverride();
    registerVersionCommand(program);
  });

  it('should register version command', () => {
    const versionCmd = program.commands.find((c) => c.name() === 'version');
    expect(versionCmd).toBeDefined();
  });

  it('should display version info when called', async () => {
    await program.parseAsync(['node', 'test', 'version']);

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('SynapSync CLI'));
    expect(mockLogger.label).toHaveBeenCalledWith('Node.js', expect.any(String));
    expect(mockLogger.label).toHaveBeenCalledWith('Platform', expect.any(String));
  });

  it('should check for updates with --check flag', async () => {
    // Mock global fetch
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: '1.0.0' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await program.parseAsync(['node', 'test', 'version', '--check']);

    expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('Checking for updates'));
    expect(mockLogger.success).toHaveBeenCalledWith(expect.stringContaining('latest version'));

    vi.unstubAllGlobals();
  });

  it('should show update available when newer version exists', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: '2.0.0' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await program.parseAsync(['node', 'test', 'version', '--check']);

    expect(mockLogger.warning).toHaveBeenCalledWith(expect.stringContaining('Update available'));

    vi.unstubAllGlobals();
  });

  it('should show dev version info when current is newer', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ version: '0.5.0' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await program.parseAsync(['node', 'test', 'version', '--check']);

    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('development version'));

    vi.unstubAllGlobals();
  });

  it('should handle network errors gracefully', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    await program.parseAsync(['node', 'test', 'version', '--check']);

    expect(mockLogger.warning).toHaveBeenCalledWith(expect.stringContaining('Could not check'));

    vi.unstubAllGlobals();
  });

  it('should handle non-ok response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
    });
    vi.stubGlobal('fetch', mockFetch);

    await program.parseAsync(['node', 'test', 'version', '--check']);

    expect(mockLogger.warning).toHaveBeenCalledWith(expect.stringContaining('Could not check'));

    vi.unstubAllGlobals();
  });
});
