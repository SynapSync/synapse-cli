/**
 * Purge Command Tests
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
import { executePurgeCommand } from '../../../src/commands/purge.js';

const mockConfigManager = {
  getSynapSyncDir: vi.fn().mockReturnValue('/project/.synapsync'),
  getProjectRoot: vi.fn().mockReturnValue('/project'),
};

describe('executePurgeCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when project is not initialized', () => {
    mockFindConfig.mockReturnValue(null);

    executePurgeCommand({ force: true });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should show preview without --force', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([]);
    vi.mocked(fs.readFileSync).mockReturnValue('# SynapSync\n.synapsync/manifest.json\n');

    executePurgeCommand({});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('completely remove'));
    expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('--force'));
    // Should NOT remove anything
    expect(fs.rmSync).not.toHaveBeenCalled();
  });

  it('should remove everything with --force', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([]);
    vi.mocked(fs.rmSync).mockImplementation(() => undefined);
    vi.mocked(fs.unlinkSync).mockImplementation(() => undefined);
    vi.mocked(fs.readFileSync).mockReturnValue(
      '# SynapSync\n.synapsync/manifest.json\n*.local.yaml\n'
    );
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    executePurgeCommand({ force: true });

    // Should remove .synapsync, config, AGENTS.md
    expect(fs.rmSync).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('completely removed'));
  });

  it('should handle nothing to remove', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.readdirSync).mockReturnValue([]);

    executePurgeCommand({ force: true });

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Nothing to remove'));
  });

  it('should handle errors during purge', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([]);
    vi.mocked(fs.rmSync).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    executePurgeCommand({ force: true });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Permission denied'));
  });

  it('should find and remove synapsync symlinks', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const pathStr = String(p);
      // Provider dirs exist
      if (pathStr.includes('.claude/')) return true;
      if (pathStr.includes('.synapsync')) return true;
      if (pathStr.includes('synapsync.config')) return true;
      if (pathStr.includes('AGENTS.md')) return true;
      if (pathStr.includes('.gitignore')) return true;
      return false;
    });
    vi.mocked(fs.readdirSync).mockImplementation((p) => {
      if (String(p).includes('.claude/skills')) {
        return [
          {
            name: 'my-skill',
            isSymbolicLink: () => true,
            isFile: () => false,
            isDirectory: () => false,
          },
        ] as unknown as fs.Dirent[];
      }
      return [] as unknown as fs.Dirent[];
    });
    vi.mocked(fs.readlinkSync).mockReturnValue('../../.synapsync/skills/general/my-skill');
    vi.mocked(fs.readFileSync).mockReturnValue('other content');
    vi.mocked(fs.rmSync).mockImplementation(() => undefined);
    vi.mocked(fs.unlinkSync).mockImplementation(() => undefined);

    executePurgeCommand({ force: true });

    expect(fs.unlinkSync).toHaveBeenCalled();
  });
});
