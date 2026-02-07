/**
 * Sync Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockFindConfig, mockSync, mockGetStatus, mockGetProviderStatus, mockRegenerateAgentsMd, mockLogger } = vi.hoisted(() => ({
  mockFindConfig: vi.fn(),
  mockSync: vi.fn(),
  mockGetStatus: vi.fn(),
  mockGetProviderStatus: vi.fn(),
  mockRegenerateAgentsMd: vi.fn(),
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

vi.mock('../../../src/services/sync/engine.js', () => ({
  SyncEngine: vi.fn().mockImplementation(function () {
    return {
      sync: mockSync,
      getStatus: mockGetStatus,
      getProviderStatus: mockGetProviderStatus,
    };
  }),
}));

vi.mock('../../../src/services/agents-md/generator.js', () => ({
  regenerateAgentsMd: (...args: unknown[]) => mockRegenerateAgentsMd(...args),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

vi.spyOn(console, 'log').mockImplementation(() => undefined);

import { executeSyncCommand, executeSyncStatusCommand } from '../../../src/commands/sync.js';

const mockConfigManager = {
  getSynapSyncDir: vi.fn().mockReturnValue('/project/.synapsync'),
  getProjectRoot: vi.fn().mockReturnValue('/project'),
  getConfig: vi.fn().mockReturnValue({
    name: 'test',
    version: '1.0.0',
    cli: { theme: 'auto', color: true, verbose: false },
    storage: { dir: '.synapsync' },
    sync: {
      method: 'symlink',
      providers: {
        claude: { enabled: true },
      },
    },
  }),
};

const emptySyncResult = {
  added: 0,
  removed: 0,
  updated: 0,
  unchanged: 5,
  total: 5,
  actions: [],
  errors: [],
  duration: 10,
  providerResults: [],
};

describe('executeSyncCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when project is not initialized', () => {
    mockFindConfig.mockReturnValue(null);

    executeSyncCommand({});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should sync and show everything in sync', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockSync.mockReturnValue(emptySyncResult);

    executeSyncCommand({});

    expect(mockSync).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Everything is in sync'));
  });

  it('should show dry run header', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockSync.mockReturnValue(emptySyncResult);

    executeSyncCommand({ dryRun: true });

    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Dry Run'));
  });

  it('should not regenerate AGENTS.md in dry run', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockSync.mockReturnValue(emptySyncResult);

    executeSyncCommand({ dryRun: true });

    expect(mockRegenerateAgentsMd).not.toHaveBeenCalled();
  });

  it('should regenerate AGENTS.md after real sync', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockSync.mockReturnValue(emptySyncResult);

    executeSyncCommand({});

    expect(mockRegenerateAgentsMd).toHaveBeenCalled();
  });

  it('should output JSON when requested', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockSync.mockReturnValue(emptySyncResult);

    executeSyncCommand({ json: true });

    expect(console.log).toHaveBeenCalledWith(JSON.stringify(emptySyncResult, null, 2));
  });

  it('should show added/removed/updated counts', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockSync.mockReturnValue({
      ...emptySyncResult,
      added: 2,
      removed: 1,
      updated: 1,
      actions: [
        { operation: 'add', cognitive: 'skill-a' },
        { operation: 'add', cognitive: 'skill-b' },
        { operation: 'remove', cognitive: 'old-skill' },
        { operation: 'update', cognitive: 'updated-skill' },
      ],
    });

    executeSyncCommand({});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('2 added'));
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('1 removed'));
  });

  it('should show errors when they occur', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockSync.mockReturnValue({
      ...emptySyncResult,
      added: 1,
      errors: [{ cognitive: 'broken-skill', message: 'Failed to sync' }],
      actions: [{ operation: 'add', cognitive: 'broken-skill' }],
    });

    executeSyncCommand({});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Failed to sync'));
  });

  it('should validate invalid type', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeSyncCommand({ type: 'invalid' });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid type'));
    expect(mockSync).not.toHaveBeenCalled();
  });

  it('should validate invalid category', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeSyncCommand({ category: 'invalid' });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid category'));
    expect(mockSync).not.toHaveBeenCalled();
  });

  it('should validate invalid provider', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeSyncCommand({ provider: 'invalid' });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid provider'));
    expect(mockSync).not.toHaveBeenCalled();
  });

  it('should show provider results', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockSync.mockReturnValue({
      ...emptySyncResult,
      added: 1,
      actions: [{ operation: 'add', cognitive: 'my-skill' }],
      providerResults: [{
        provider: 'claude',
        method: 'symlink',
        created: [{ name: 'my-skill', success: true }],
        skipped: [],
        removed: [],
        errors: [],
      }],
    });

    executeSyncCommand({});

    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Provider sync'));
  });

  it('should show dry run hint', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockSync.mockReturnValue({
      ...emptySyncResult,
      added: 1,
      actions: [{ operation: 'add', cognitive: 'my-skill' }],
    });

    executeSyncCommand({ dryRun: true });

    expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('without --dry-run'));
  });
});

describe('executeSyncStatusCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when project is not initialized', () => {
    mockFindConfig.mockReturnValue(null);

    executeSyncStatusCommand({});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should show in-sync status', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetStatus.mockReturnValue({
      inSync: true,
      manifest: 5,
      filesystem: 5,
      newInFilesystem: 0,
      removedFromFilesystem: 0,
      modified: 0,
    });
    mockGetProviderStatus.mockReturnValue({ valid: 3, broken: 0, orphaned: 0 });

    executeSyncStatusCommand({});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('in sync'));
  });

  it('should show out-of-sync status with details', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetStatus.mockReturnValue({
      inSync: false,
      manifest: 5,
      filesystem: 7,
      newInFilesystem: 2,
      removedFromFilesystem: 0,
      modified: 0,
    });
    mockGetProviderStatus.mockReturnValue({ valid: 3, broken: 0, orphaned: 0 });

    executeSyncStatusCommand({});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Out of sync'));
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('2 new'));
  });

  it('should output JSON when requested', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetStatus.mockReturnValue({
      inSync: true,
      manifest: 5,
      filesystem: 5,
    });
    mockGetProviderStatus.mockReturnValue({ valid: 3, broken: 0, orphaned: 0 });

    executeSyncStatusCommand({ json: true });

    expect(console.log).toHaveBeenCalled();
  });

  it('should show sync hint when out of sync', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetStatus.mockReturnValue({
      inSync: false,
      manifest: 3,
      filesystem: 5,
      newInFilesystem: 2,
      removedFromFilesystem: 0,
      modified: 0,
    });
    mockGetProviderStatus.mockReturnValue({ valid: 0, broken: 0, orphaned: 0 });

    executeSyncStatusCommand({});

    expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('synapsync sync'));
  });
});
