/**
 * List Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockFindConfig, mockRegistryList, mockLogger } = vi.hoisted(() => ({
  mockFindConfig: vi.fn(),
  mockRegistryList: vi.fn(),
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
    return { list: mockRegistryList };
  }),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

vi.spyOn(console, 'log').mockImplementation(() => undefined);

import * as fs from 'fs';
import { executeListCommand } from '../../../src/commands/list.js';

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
    'test-agent': {
      name: 'test-agent',
      type: 'agent',
      category: 'backend',
      version: '2.0.0',
      installedAt: '2026-01-01T00:00:00.000Z',
      source: 'local',
    },
  },
  syncs: {},
};

describe('executeListCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when project is not initialized', async () => {
    mockFindConfig.mockReturnValue(null);

    await executeListCommand({});

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should list installed cognitives', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest));

    await executeListCommand({});

    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Installed Cognitives'));
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('test-skill'));
  });

  it('should show empty message when no cognitives', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({
        ...mockManifest,
        cognitives: {},
      })
    );

    await executeListCommand({});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('No cognitives installed'));
  });

  it('should filter by type', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest));

    await executeListCommand({ type: 'skill' });

    // Should show skill but not agent
    const logCalls = mockLogger.log.mock.calls.map((c: unknown[]) => String(c[0]));
    const hasSkill = logCalls.some((c: string) => c.includes('test-skill'));
    expect(hasSkill).toBe(true);
  });

  it('should show error for invalid type', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    await executeListCommand({ type: 'invalid' });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid type'));
  });

  it('should show error for invalid category', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);

    await executeListCommand({ category: 'invalid' });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Invalid category'));
  });

  it('should output JSON when requested', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest));

    await executeListCommand({ json: true });

    expect(console.log).toHaveBeenCalled();
  });

  it('should handle missing manifest file', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    await executeListCommand({});

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('No cognitives installed'));
  });

  it('should list remote cognitives', async () => {
    mockRegistryList.mockResolvedValue([
      {
        name: 'remote-skill',
        type: 'skill',
        category: 'general',
        version: '1.0.0',
        description: 'A remote skill',
        tags: ['test'],
        author: 'author',
      },
    ]);

    await executeListCommand({ remote: true });

    expect(mockRegistryList).toHaveBeenCalled();
    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Registry'));
  });

  it('should handle remote registry errors', async () => {
    mockRegistryList.mockRejectedValue(new Error('Network error'));

    await executeListCommand({ remote: true });

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Network error'));
  });

  it('should show empty message for remote with no results', async () => {
    mockRegistryList.mockResolvedValue([]);

    await executeListCommand({ remote: true });

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('No cognitives found'));
  });

  it('should filter remote cognitives by type', async () => {
    mockRegistryList.mockResolvedValue([
      { name: 's1', type: 'skill', category: 'general', version: '1.0.0', tags: [] },
      { name: 'a1', type: 'agent', category: 'general', version: '1.0.0', tags: [] },
    ]);

    await executeListCommand({ remote: true, type: 'skill' });

    // Should only show skills, not agents
    const logCalls = mockLogger.log.mock.calls.map((c: unknown[]) => String(c[0]));
    const hasAgent = logCalls.some((c: string) => c.includes('a1'));
    expect(hasAgent).toBe(false);
  });

  it('should output remote JSON when requested', async () => {
    mockRegistryList.mockResolvedValue([
      { name: 's1', type: 'skill', category: 'general', version: '1.0.0', tags: [] },
    ]);

    await executeListCommand({ remote: true, json: true });

    expect(console.log).toHaveBeenCalled();
  });
});
