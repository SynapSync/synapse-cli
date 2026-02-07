/**
 * Add Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const {
  mockFindConfig,
  mockRegistryDownload,
  mockRegistryFindByName,
  mockRegistryDownloadAsset,
  mockSync,
  mockRegenerateAgentsMd,
  mockLogger,
} = vi.hoisted(() => ({
  mockFindConfig: vi.fn(),
  mockRegistryDownload: vi.fn(),
  mockRegistryFindByName: vi.fn(),
  mockRegistryDownloadAsset: vi.fn(),
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
    dim: vi.fn(),
  },
}));

vi.mock('fs');

vi.mock('../../../src/services/config/manager.js', () => ({
  ConfigManager: {
    findConfig: (...args: unknown[]) => mockFindConfig(...args),
  },
}));

vi.mock('../../../src/services/registry/client.js', () => ({
  RegistryClient: vi.fn().mockImplementation(function () {
    return {
      download: mockRegistryDownload,
      findByName: mockRegistryFindByName,
      downloadAsset: mockRegistryDownloadAsset,
    };
  }),
  CognitiveNotFoundError: class CognitiveNotFoundError extends Error {
    cognitiveName: string;
    constructor(name: string) {
      super(`Cognitive '${name}' not found`);
      this.cognitiveName = name;
    }
  },
  RegistryError: class RegistryError extends Error {
    constructor(message: string) {
      super(message);
    }
  },
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

import * as fs from 'fs';
import { executeAddCommand, GitHubInstallError } from '../../../src/commands/add.js';
import { CognitiveNotFoundError, RegistryError } from '../../../src/services/registry/client.js';

const mockConfigManager = {
  getSynapSyncDir: vi.fn().mockReturnValue('/project/.synapsync'),
  getProjectRoot: vi.fn().mockReturnValue('/project'),
  getConfig: vi.fn().mockReturnValue({
    name: 'test',
    version: '1.0.0',
    sync: { method: 'symlink', providers: {} },
  }),
};

describe('executeAddCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSync.mockReturnValue({ providerResults: [] });
  });

  it('should show error when project is not initialized', async () => {
    mockFindConfig.mockReturnValue(null);

    await executeAddCommand('test-skill', {});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should install from registry', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockRegistryDownload.mockResolvedValue({
      content: '# My Skill',
      manifest: {
        name: 'test-skill',
        type: 'skill',
        version: '1.0.0',
        category: 'general',
        file: 'SKILL.md',
      },
    });
    mockRegistryFindByName.mockResolvedValue(null);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as unknown as string);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    await executeAddCommand('test-skill', {});

    expect(mockRegistryDownload).toHaveBeenCalledWith('test-skill');
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
  });

  it('should show error when already installed without --force', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockRegistryDownload.mockResolvedValue({
      content: '# My Skill',
      manifest: {
        name: 'test-skill',
        type: 'skill',
        version: '1.0.0',
        category: 'general',
        file: 'SKILL.md',
      },
    });
    vi.mocked(fs.existsSync).mockReturnValue(true);

    await executeAddCommand('test-skill', {});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('already installed'));
    expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('--force'));
  });

  it('should overwrite with --force', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockRegistryDownload.mockResolvedValue({
      content: '# My Skill',
      manifest: {
        name: 'test-skill',
        type: 'skill',
        version: '1.0.0',
        category: 'general',
        file: 'SKILL.md',
      },
    });
    mockRegistryFindByName.mockResolvedValue(null);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({
        version: '1.0.0',
        lastUpdated: '2026-01-01',
        cognitives: {},
        syncs: {},
      })
    );
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as unknown as string);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    await executeAddCommand('test-skill', { force: true });

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
  });

  it('should install from local path', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.includes('/my-skill') && !pathStr.includes('.synapsync')) return true;
      if (pathStr.includes('SKILL.md')) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      if (String(p).includes('SKILL.md')) {
        return '---\nname: my-skill\ntype: skill\nversion: 1.0.0\n---\n# My Skill';
      }
      return '{}';
    });
    vi.mocked(fs.readdirSync).mockReturnValue([]);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as unknown as string);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    await executeAddCommand('./my-skill', {});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
  });

  it('should show error for missing local path', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await executeAddCommand('./nonexistent', {});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Path not found'));
  });

  it('should handle GitHubInstallError when no cognitive found', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    // Mock global fetch to return 404 for all files
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal('fetch', mockFetch);

    await executeAddCommand('github:user/repo', {});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('GitHub install failed'));
    vi.unstubAllGlobals();
  });

  it('should handle CognitiveNotFoundError', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockRegistryDownload.mockRejectedValue(new CognitiveNotFoundError('nonexistent'));

    await executeAddCommand('nonexistent', {});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('not found'));
    expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('--remote'));
  });

  it('should handle RegistryError', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockRegistryDownload.mockRejectedValue(new RegistryError('Registry unavailable'));

    await executeAddCommand('test-skill', {});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Registry error'));
  });

  it('should handle generic errors', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockRegistryDownload.mockRejectedValue(new Error('Unknown failure'));

    await executeAddCommand('test-skill', {});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Installation failed'));
  });

  it('should parse GitHub URL source and attempt install', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    // Mock global fetch to return 404 for all files
    const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 404 });
    vi.stubGlobal('fetch', mockFetch);

    await executeAddCommand('https://github.com/user/repo', {});

    // Should have tried to fetch from raw.githubusercontent.com
    expect(mockFetch).toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('GitHub install failed'));
    vi.unstubAllGlobals();
  });

  it('should auto-sync to providers after install', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockRegistryDownload.mockResolvedValue({
      content: '# My Skill',
      manifest: {
        name: 'test-skill',
        type: 'skill',
        version: '1.0.0',
        category: 'general',
        file: 'SKILL.md',
      },
    });
    mockRegistryFindByName.mockResolvedValue(null);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as unknown as string);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
    mockSync.mockReturnValue({
      providerResults: [
        {
          provider: 'claude',
          created: [{ name: 'test-skill', success: true }],
          skipped: [],
          removed: [],
          errors: [],
        },
      ],
    });

    await executeAddCommand('test-skill', {});

    expect(mockSync).toHaveBeenCalled();
    expect(mockRegenerateAgentsMd).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Synced to claude'));
  });

  it('should use custom category from options', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockRegistryDownload.mockResolvedValue({
      content: '# My Skill',
      manifest: {
        name: 'test-skill',
        type: 'skill',
        version: '1.0.0',
        category: 'general',
        file: 'SKILL.md',
      },
    });
    mockRegistryFindByName.mockResolvedValue(null);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as unknown as string);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    await executeAddCommand('test-skill', { category: 'frontend' });

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('frontend'));
  });
});
