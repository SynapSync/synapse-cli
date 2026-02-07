/**
 * Uninstall Command Tests
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

vi.mock('../../../src/services/agents-md/generator.js', () => ({
  regenerateAgentsMd: vi.fn(),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

import * as fs from 'fs';
import { executeUninstallCommand } from '../../../src/commands/uninstall.js';

const mockConfigManager = {
  getSynapSyncDir: vi.fn().mockReturnValue('/project/.synapsync'),
  getProjectRoot: vi.fn().mockReturnValue('/project'),
};

const mockManifest = {
  version: '1.0.0',
  lastUpdated: '2026-01-01T00:00:00.000Z',
  cognitives: {
    'test-skill': {
      name: 'test-skill',
      type: 'skill',
      category: 'general',
      version: '1.0.0',
      installedAt: '2026-01-01T00:00:00.000Z',
      source: 'registry',
    },
  },
  syncs: {},
};

describe('executeUninstallCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when project is not initialized', () => {
    mockFindConfig.mockReturnValue(null);

    executeUninstallCommand('test-skill', { force: true });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should show error when cognitive is not installed', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({
        ...mockManifest,
        cognitives: {},
      })
    );

    executeUninstallCommand('nonexistent', { force: true });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('not installed'));
  });

  it('should show confirmation prompt without --force', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest));

    executeUninstallCommand('test-skill', {});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('About to uninstall'));
    // Should NOT delete files without --force
    expect(fs.rmSync).not.toHaveBeenCalled();
  });

  it('should uninstall with --force', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest));
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
    vi.mocked(fs.rmSync).mockImplementation(() => undefined);

    executeUninstallCommand('test-skill', { force: true });

    expect(fs.rmSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Uninstalled'));
  });

  it('should keep files with --keep-files', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest));
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);

    executeUninstallCommand('test-skill', { force: true, keepFiles: true });

    expect(fs.rmSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should handle errors during uninstall', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest));
    vi.mocked(fs.rmSync).mockImplementation(() => {
      throw new Error('Permission denied');
    });

    executeUninstallCommand('test-skill', { force: true });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Permission denied'));
  });

  it('should handle missing manifest file', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    executeUninstallCommand('test-skill', { force: true });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('not installed'));
  });
});
