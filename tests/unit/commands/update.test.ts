/**
 * Update Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const {
  mockFindConfig,
  mockGetCognitives,
  mockUpdateCognitive,
  mockManifestSave,
  mockCheckOne,
  mockCheckAll,
  mockRegistryDownload,
  mockSync,
  mockRegenerateAgentsMd,
  mockLogger,
} = vi.hoisted(() => ({
  mockFindConfig: vi.fn(),
  mockGetCognitives: vi.fn(),
  mockUpdateCognitive: vi.fn(),
  mockManifestSave: vi.fn(),
  mockCheckOne: vi.fn(),
  mockCheckAll: vi.fn(),
  mockRegistryDownload: vi.fn(),
  mockSync: vi.fn(),
  mockRegenerateAgentsMd: vi.fn(),
  mockLogger: {
    log: vi.fn(),
    line: vi.fn(),
    error: vi.fn(),
    hint: vi.fn(),
    bold: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dim: vi.fn(),
  },
}));

vi.mock('fs');

vi.mock('../../../src/services/config/manager.js', () => ({
  ConfigManager: {
    findConfig: (...args: unknown[]) => mockFindConfig(...args),
  },
}));

vi.mock('../../../src/services/manifest/manager.js', () => ({
  ManifestManager: vi.fn().mockImplementation(function () {
    return {
      getCognitives: mockGetCognitives,
      updateCognitive: mockUpdateCognitive,
      save: mockManifestSave,
    };
  }),
}));

vi.mock('../../../src/services/maintenance/update-checker.js', () => ({
  UpdateChecker: vi.fn().mockImplementation(function () {
    return {
      checkOne: mockCheckOne,
      checkAll: mockCheckAll,
    };
  }),
}));

vi.mock('../../../src/services/registry/client.js', () => ({
  RegistryClient: vi.fn().mockImplementation(function () {
    return { download: mockRegistryDownload };
  }),
}));

vi.mock('../../../src/services/sync/engine.js', () => ({
  SyncEngine: vi.fn().mockImplementation(function () {
    return { sync: mockSync };
  }),
}));

vi.mock('../../../src/services/agents-md/generator.js', () => ({
  regenerateAgentsMd: (...args: unknown[]) => mockRegenerateAgentsMd(...args),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

vi.spyOn(console, 'log').mockImplementation(() => undefined);

import * as fs from 'fs';
import { executeUpdateCommand, executeCheckOutdatedCommand } from '../../../src/commands/update.js';

const mockConfigManager = {
  getSynapSyncDir: vi.fn().mockReturnValue('/project/.synapsync'),
  getProjectRoot: vi.fn().mockReturnValue('/project'),
  getConfig: vi.fn().mockReturnValue({
    name: 'test',
    version: '1.0.0',
    sync: { method: 'symlink', providers: {} },
  }),
};

const installedCognitives = [
  { name: 'test-skill', type: 'skill', category: 'general', version: '1.0.0', source: 'registry' },
  { name: 'local-skill', type: 'skill', category: 'general', version: '1.0.0', source: 'local' },
];

describe('executeUpdateCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when project is not initialized', async () => {
    mockFindConfig.mockReturnValue(null);

    await executeUpdateCommand();

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should show message when no cognitives installed', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue([]);

    await executeUpdateCommand();

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('No cognitives installed'));
  });

  it('should check all cognitives and show up to date', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue(installedCognitives);
    mockCheckAll.mockResolvedValue({
      checked: 2,
      updatesAvailable: [],
      upToDate: [{ name: 'test-skill', hasUpdate: false }],
      errors: [],
      checkTime: new Date().toISOString(),
    });

    await executeUpdateCommand(undefined, { all: true });

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('up to date'));
  });

  it('should check specific cognitive', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue(installedCognitives);
    mockCheckOne.mockResolvedValue({
      name: 'test-skill',
      hasUpdate: false,
      currentVersion: '1.0.0',
      latestVersion: '1.0.0',
    });

    await executeUpdateCommand('test-skill');

    expect(mockCheckOne).toHaveBeenCalled();
  });

  it('should show error for non-installed cognitive', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue(installedCognitives);

    await executeUpdateCommand('nonexistent');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('not installed'));
  });

  it('should show error for local cognitive', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue(installedCognitives);

    await executeUpdateCommand('local-skill');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('locally'));
  });

  it('should output JSON when requested', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue(installedCognitives);
    mockCheckAll.mockResolvedValue({
      checked: 1,
      updatesAvailable: [],
      upToDate: [],
      errors: [],
      checkTime: new Date().toISOString(),
    });

    await executeUpdateCommand(undefined, { all: true, json: true });

    expect(console.log).toHaveBeenCalled();
  });

  it('should show dry run hint when updates available', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue(installedCognitives);
    mockCheckAll.mockResolvedValue({
      checked: 1,
      updatesAvailable: [{ name: 'test-skill', hasUpdate: true, currentVersion: '1.0.0', latestVersion: '2.0.0', type: 'skill', category: 'general' }],
      upToDate: [],
      errors: [],
      checkTime: new Date().toISOString(),
    });

    await executeUpdateCommand(undefined, { all: true, dryRun: true });

    expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('without --dry-run'));
  });

  it('should perform update when updates available', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue(installedCognitives);
    mockCheckAll.mockResolvedValue({
      checked: 1,
      updatesAvailable: [{ name: 'test-skill', hasUpdate: true, currentVersion: '1.0.0', latestVersion: '2.0.0', type: 'skill', category: 'general' }],
      upToDate: [],
      errors: [],
      checkTime: new Date().toISOString(),
    });
    mockRegistryDownload.mockResolvedValue({ content: '# Updated skill' });
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    await executeUpdateCommand(undefined, { all: true });

    expect(mockRegistryDownload).toHaveBeenCalledWith('test-skill');
    expect(mockUpdateCognitive).toHaveBeenCalled();
    expect(mockManifestSave).toHaveBeenCalled();
    expect(mockSync).toHaveBeenCalled();
    expect(mockRegenerateAgentsMd).toHaveBeenCalled();
  });

  it('should handle download errors gracefully', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue(installedCognitives);
    mockCheckAll.mockResolvedValue({
      checked: 1,
      updatesAvailable: [{ name: 'test-skill', hasUpdate: true, currentVersion: '1.0.0', latestVersion: '2.0.0', type: 'skill', category: 'general' }],
      upToDate: [],
      errors: [],
      checkTime: new Date().toISOString(),
    });
    mockRegistryDownload.mockRejectedValue(new Error('Download failed'));

    await executeUpdateCommand(undefined, { all: true });

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Failed'));
  });
});

describe('executeCheckOutdatedCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when project is not initialized', async () => {
    mockFindConfig.mockReturnValue(null);

    await executeCheckOutdatedCommand({});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should show message when no cognitives installed', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue([]);

    await executeCheckOutdatedCommand({});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('No cognitives installed'));
  });

  it('should show all up to date', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue(installedCognitives);
    mockCheckAll.mockResolvedValue({
      checked: 2,
      updatesAvailable: [],
      upToDate: [{ name: 'test-skill' }],
      errors: [],
      checkTime: new Date().toISOString(),
    });

    await executeCheckOutdatedCommand({});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('up to date'));
  });

  it('should show update hint when outdated', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockGetCognitives.mockReturnValue(installedCognitives);
    mockCheckAll.mockResolvedValue({
      checked: 2,
      updatesAvailable: [{ name: 'test-skill', currentVersion: '1.0.0', latestVersion: '2.0.0' }],
      upToDate: [],
      errors: [],
      checkTime: new Date().toISOString(),
    });

    await executeCheckOutdatedCommand({});

    expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('synapsync update'));
  });
});
