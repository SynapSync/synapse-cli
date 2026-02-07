/**
 * Providers Command Tests
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

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

import * as fs from 'fs';
import { executeProvidersCommand } from '../../../src/commands/providers.js';

const mockConfigManager = {
  getSynapSyncDir: vi.fn().mockReturnValue('/project/.synapsync'),
  getProjectRoot: vi.fn().mockReturnValue('/project'),
  getConfig: vi.fn().mockReturnValue({
    name: 'test',
    version: '1.0.0',
    sync: {
      method: 'symlink',
      providers: {
        claude: { enabled: true, paths: { skill: '.claude/skills', agent: '.claude/agents', prompt: '.claude/prompts', workflow: '.claude/workflows', tool: '.claude/tools' } },
      },
    },
  }),
  get: vi.fn(),
  set: vi.fn(),
  save: vi.fn(),
};

describe('executeProvidersCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(false);
  });

  it('should show error when project is not initialized', () => {
    mockFindConfig.mockReturnValue(null);

    executeProvidersCommand('list');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should list all providers', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('list');

    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Providers'));
  });

  it('should default to list with empty args', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('');

    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Providers'));
  });

  it('should enable a provider', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue(undefined);

    executeProvidersCommand('enable openai');

    expect(mockConfigManager.set).toHaveBeenCalledWith('sync.providers.openai.enabled', true);
    expect(mockConfigManager.save).toHaveBeenCalled();
    expect(mockLogger.success).toHaveBeenCalledWith(expect.stringContaining('openai'));
  });

  it('should show info when provider already enabled', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue(true);

    executeProvidersCommand('enable claude');

    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('already enabled'));
  });

  it('should show error for enable without provider name', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('enable');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Provider name is required'));
  });

  it('should show error for unknown provider on enable', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('enable unknown');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Unknown provider'));
  });

  it('should disable a provider', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue(true);

    executeProvidersCommand('disable claude');

    expect(mockConfigManager.set).toHaveBeenCalledWith('sync.providers.claude.enabled', false);
    expect(mockConfigManager.save).toHaveBeenCalled();
  });

  it('should show info when provider already disabled', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockConfigManager.get.mockReturnValue(false);

    executeProvidersCommand('disable openai');

    expect(mockLogger.info).toHaveBeenCalledWith(expect.stringContaining('already disabled'));
  });

  it('should show error for disable without provider name', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('disable');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Provider name is required'));
  });

  it('should set custom path for provider', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('path claude .claude-code/');

    expect(mockConfigManager.set).toHaveBeenCalledWith(
      'sync.providers.claude.paths.skill',
      '.claude-code/skills'
    );
    expect(mockConfigManager.save).toHaveBeenCalled();
  });

  it('should normalize path without trailing slash', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('path claude .custom');

    expect(mockConfigManager.set).toHaveBeenCalledWith(
      'sync.providers.claude.paths.skill',
      '.custom/skills'
    );
  });

  it('should show error for path without provider name', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('path');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Provider name is required'));
  });

  it('should show error for path without path argument', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('path claude');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Path is required'));
  });

  it('should show provider info when name used as subcommand', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('claude');

    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Claude'));
  });

  it('should show error for unknown subcommand', () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    executeProvidersCommand('foobar');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Unknown subcommand'));
  });
});
