/**
 * Clean Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockFindConfig, mockClean, mockLogger } = vi.hoisted(() => ({
  mockFindConfig: vi.fn(),
  mockClean: vi.fn(),
  mockLogger: {
    log: vi.fn(),
    line: vi.fn(),
    error: vi.fn(),
    hint: vi.fn(),
    bold: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('../../../src/services/config/manager.js', () => ({
  ConfigManager: {
    findConfig: (...args: unknown[]) => mockFindConfig(...args),
  },
}));

vi.mock('../../../src/services/maintenance/cleaner.js', () => ({
  CleanerService: vi.fn().mockImplementation(function () {
    return { clean: mockClean };
  }),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

import { executeCleanCommand } from '../../../src/commands/clean.js';

// Mock console.log for JSON output
vi.spyOn(console, 'log').mockImplementation(() => undefined);

const mockConfigManager = {
  getSynapSyncDir: vi.fn().mockReturnValue('/project/.synapsync'),
  getProjectRoot: vi.fn().mockReturnValue('/project'),
  getConfig: vi.fn().mockReturnValue({
    name: 'test',
    version: '1.0.0',
    cli: { theme: 'auto', color: true, verbose: false },
    storage: { dir: '.synapsync' },
    sync: { method: 'symlink', providers: {} },
  }),
};

describe('executeCleanCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when project is not initialized', () => {
    mockFindConfig.mockReturnValue(null);

    executeCleanCommand();

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should run clean with options', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockClean.mockReturnValue({ cleaned: [], errors: [], sizeFreed: '0 B' });

    executeCleanCommand({ cache: true });

    expect(mockClean).toHaveBeenCalledWith(expect.objectContaining({ cache: true }));
  });

  it('should display nothing to clean message when empty', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockClean.mockReturnValue({ cleaned: [], errors: [], sizeFreed: '0 B' });

    executeCleanCommand({ cache: true });

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Nothing to clean'));
  });

  it('should display cleaned items count', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockClean.mockReturnValue({
      cleaned: [{ type: 'cache', path: '/project/.synapsync/cache/file', size: 1024 }],
      errors: [],
      sizeFreed: '1.0 KB',
    });

    executeCleanCommand({ cache: true });

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Cleaned 1 item'));
  });

  it('should show dry run preview', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockClean.mockReturnValue({
      cleaned: [{ type: 'cache', path: '/project/.synapsync/cache/file', size: 512 }],
      errors: [],
      sizeFreed: '512 B',
    });

    executeCleanCommand({ cache: true, dryRun: true });

    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Dry Run'));
  });

  it('should output JSON when requested', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    const result = { cleaned: [], errors: [], sizeFreed: '0 B' };
    mockClean.mockReturnValue(result);

    executeCleanCommand({ cache: true, json: true });

    expect(console.log).toHaveBeenCalledWith(JSON.stringify(result, null, 2));
  });

  it('should show error count', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockClean.mockReturnValue({
      cleaned: [],
      errors: [{ path: '/some/path', message: 'Permission denied' }],
      sizeFreed: '0 B',
    });

    executeCleanCommand({ all: true });

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('1 error'));
  });

  it('should handle config read errors gracefully', () => {
    const manager = {
      ...mockConfigManager,
      getConfig: vi.fn().mockImplementation(() => {
        throw new Error('Config broken');
      }),
    };
    mockFindConfig.mockReturnValue(manager);
    mockClean.mockReturnValue({ cleaned: [], errors: [], sizeFreed: '0 B' });

    // Should not throw
    executeCleanCommand({ cache: true });

    expect(mockClean).toHaveBeenCalled();
  });
});
