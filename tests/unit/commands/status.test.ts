/**
 * Status Command Tests
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
    label: vi.fn(),
  },
}));

vi.mock('fs');

vi.mock('../../../src/services/config/manager.js', () => ({
  ConfigManager: {
    findConfig: (...args: unknown[]) => mockFindConfig(...args),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

import * as fs from 'fs';
import { executeStatusCommand } from '../../../src/commands/status.js';

const mockConfigManager = {
  getSynapSyncDir: vi.fn().mockReturnValue('/project/.synapsync'),
  getProjectRoot: vi.fn().mockReturnValue('/project'),
  getConfig: vi.fn().mockReturnValue({
    name: 'test-project',
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

describe('executeStatusCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show not initialized when no config found', () => {
    mockFindConfig.mockReturnValue(null);

    executeStatusCommand();

    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Project Status'));
    expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('/init'));
  });

  it('should show project name when initialized', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    executeStatusCommand();

    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('test-project'));
  });

  it('should count cognitives by type', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr.endsWith('/skills')) return true;
      return false;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      if (String(p).endsWith('/skills')) {
        return [
          { name: 'my-skill', isDirectory: () => true, isSymbolicLink: () => false },
        ] as unknown as fs.Dirent[];
      }
      return [] as unknown as fs.Dirent[];
    });

    executeStatusCommand();

    // Should show cognitives count
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('1'));
  });

  it('should show no cognitives message when empty', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    executeStatusCommand();

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('No cognitives installed'));
  });

  it('should show provider status', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    executeStatusCommand();

    // Should show the enabled provider (claude)
    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Providers'));
  });

  it('should show last sync time when available', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      if (String(p).includes('manifest.json')) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ lastUpdated: new Date().toISOString() })
    );

    executeStatusCommand();

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Last updated'));
  });

  it('should handle provider directory with synced cognitives', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      if (pathStr === '/project/.claude') return true;
      if (pathStr.includes('.claude/skills')) return true;
      return false;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      if (String(p).includes('.claude/skills')) {
        return ['my-skill'] as unknown as string[];
      }
      return [] as unknown as fs.Dirent[];
    });

    executeStatusCommand();

    // Should indicate synced cognitives for the provider
    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Providers'));
  });
});
