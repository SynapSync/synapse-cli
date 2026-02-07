/**
 * Config Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockFindConfig, mockLogger } = vi.hoisted(() => ({
  mockFindConfig: vi.fn(),
  mockLogger: {
    log: vi.fn(),
    line: vi.fn(),
    error: vi.fn(),
    hint: vi.fn(),
    bold: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    dim: vi.fn(),
  },
}));

vi.mock('../../../src/services/config/manager.js', () => ({
  ConfigManager: {
    findConfig: (...args: unknown[]) => mockFindConfig(...args),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

import { executeConfigCommand } from '../../../src/commands/config.js';

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
  flatten: vi.fn().mockReturnValue({
    'name': 'test',
    'cli.theme': 'auto',
    'cli.color': true,
    'cli.verbose': false,
    'storage.dir': '.synapsync',
  }),
  get: vi.fn(),
  set: vi.fn(),
  save: vi.fn(),
};

describe('executeConfigCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when project is not initialized', () => {
    mockFindConfig.mockReturnValue(null);

    executeConfigCommand('list');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should list all configuration values', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeConfigCommand('list');

    expect(mockConfigManager.flatten).toHaveBeenCalled();
    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Configuration'));
  });

  it('should default to list when no args', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeConfigCommand('');

    expect(mockConfigManager.flatten).toHaveBeenCalled();
  });

  it('should get a specific config value', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue('auto');

    executeConfigCommand('get cli.theme');

    expect(mockConfigManager.get).toHaveBeenCalledWith('cli.theme');
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('cli.theme'));
  });

  it('should show warning when key not found', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue(undefined);

    executeConfigCommand('get nonexistent.key');

    expect(mockLogger.warning).toHaveBeenCalledWith(expect.stringContaining('Key not found'));
  });

  it('should show error when get has no key', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeConfigCommand('get');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Key is required'));
  });

  it('should set a config value', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue('auto');

    executeConfigCommand('set cli.theme dark');

    expect(mockConfigManager.set).toHaveBeenCalledWith('cli.theme', 'dark');
    expect(mockConfigManager.save).toHaveBeenCalled();
    expect(mockLogger.success).toHaveBeenCalled();
  });

  it('should warn when creating new key', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue(undefined);

    executeConfigCommand('set new.key value');

    expect(mockLogger.warning).toHaveBeenCalledWith(expect.stringContaining('Created new key'));
  });

  it('should show error when set has no key', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeConfigCommand('set');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Key is required'));
  });

  it('should show error when set has no value', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeConfigCommand('set cli.theme');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Value is required'));
  });

  it('should parse boolean values', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue(true);

    executeConfigCommand('set cli.verbose true');

    expect(mockConfigManager.set).toHaveBeenCalledWith('cli.verbose', true);
  });

  it('should parse number values', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue(42);

    executeConfigCommand('set some.count 42');

    expect(mockConfigManager.set).toHaveBeenCalledWith('some.count', 42);
  });

  it('should treat unknown action as get shorthand', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue('auto');

    executeConfigCommand('cli.theme');

    expect(mockConfigManager.get).toHaveBeenCalledWith('cli.theme');
  });
});
