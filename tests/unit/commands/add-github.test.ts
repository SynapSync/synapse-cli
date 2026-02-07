/**
 * GitHub Installation Tests
 *
 * Tests for installFromGitHub and related helpers in add.ts
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const { mockFindConfig, mockSync, mockRegenerateAgentsMd, mockLogger } = vi.hoisted(() => ({
  mockFindConfig: vi.fn(),
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
      download: vi.fn(),
      findByName: vi.fn(),
      downloadAsset: vi.fn(),
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

const mockConfigManager = {
  getSynapSyncDir: vi.fn().mockReturnValue('/project/.synapsync'),
  getProjectRoot: vi.fn().mockReturnValue('/project'),
  getConfig: vi.fn().mockReturnValue({
    name: 'test',
    version: '1.0.0',
    sync: { method: 'symlink', providers: {} },
  }),
};

// Helpers for mocking fetch responses
function mockFetchResponses(responses: Record<string, string | null>) {
  const mockFetch = vi.fn().mockImplementation(async (url: string) => {
    const content = responses[url] ?? null;
    if (content === null) {
      return { ok: false, status: 404, text: async () => '' };
    }
    return { ok: true, status: 200, text: async () => content };
  });
  vi.stubGlobal('fetch', mockFetch);
  return mockFetch;
}

const SKILL_CONTENT = `---
name: my-skill
type: skill
version: 1.0.0
description: A test skill
author: testuser
category: general
---
# My Skill

This is a test skill.`;

const AGENT_CONTENT = `---
name: my-agent
type: agent
version: 2.0.0
description: A test agent
author: testuser
category: automation
---
# My Agent

This is a test agent.`;

const MANIFEST_JSON = JSON.stringify({
  name: 'manifest-skill',
  type: 'skill',
  version: '1.2.0',
  description: 'Skill with manifest',
  author: 'testuser',
  license: 'MIT',
  category: 'frontend',
  tags: ['test'],
  providers: ['claude'],
  file: 'SKILL.md',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('GitHub Installation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSync.mockReturnValue({ providerResults: [] });
    mockFindConfig.mockReturnValue(mockConfigManager);
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as unknown as string);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('successful installs', () => {
    it('should install from github:user/repo with SKILL.md', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': SKILL_CONTENT,
      });

      await executeAddCommand('github:user/repo', {});

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('my-skill'));
    });

    it('should install from github:user/repo/subpath', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/skills/general/my-skill/manifest.json':
          null,
        'https://raw.githubusercontent.com/user/repo/main/skills/general/my-skill/SKILL.md':
          SKILL_CONTENT,
      });

      await executeAddCommand('github:user/repo/skills/general/my-skill', {});

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
    });

    it('should install from github:user/repo#develop (specific branch)', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/develop/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/develop/SKILL.md': SKILL_CONTENT,
      });

      await executeAddCommand('github:user/repo#develop', {});

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
    });

    it('should install from full GitHub URL', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': SKILL_CONTENT,
      });

      await executeAddCommand('https://github.com/user/repo', {});

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
    });

    it('should detect AGENT.md when SKILL.md is not found', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': null,
        'https://raw.githubusercontent.com/user/repo/main/AGENT.md': AGENT_CONTENT,
      });

      await executeAddCommand('github:user/repo', {});

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('my-agent'));
    });
  });

  describe('manifest.json-based install', () => {
    it('should use manifest.json when present', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': MANIFEST_JSON,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': '# Manifest Skill Content',
      });

      await executeAddCommand('github:user/repo', {});

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('manifest-skill'));
    });

    it('should throw when manifest.json references missing file', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': MANIFEST_JSON,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': null,
      });

      await executeAddCommand('github:user/repo', {});

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('GitHub install failed')
      );
      expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('Repository:'));
    });

    it('should throw when manifest.json is invalid JSON', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': '{ invalid json }',
      });

      await executeAddCommand('github:user/repo', {});

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('GitHub install failed')
      );
    });
  });

  describe('error handling', () => {
    it('should handle 404 when no cognitive file found', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': null,
        'https://raw.githubusercontent.com/user/repo/main/AGENT.md': null,
        'https://raw.githubusercontent.com/user/repo/main/PROMPT.md': null,
        'https://raw.githubusercontent.com/user/repo/main/WORKFLOW.yaml': null,
        'https://raw.githubusercontent.com/user/repo/main/TOOL.md': null,
      });

      await executeAddCommand('github:user/repo', {});

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('No cognitive file found')
      );
    });

    it('should handle network errors gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.stubGlobal('fetch', mockFetch);

      await executeAddCommand('github:user/repo', {});

      // fetchGitHubFile catches and returns null, so it falls through to "no cognitive found"
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('No cognitive file found')
      );
    });
  });

  describe('--force flag', () => {
    it('should block install when already installed without --force', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': SKILL_CONTENT,
      });

      await executeAddCommand('github:user/repo', {});

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('already installed'));
      expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('--force'));
    });

    it('should overwrite when --force is used', async () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        // Target dir exists but manifest.json doesn't
        if (pathStr.includes('.synapsync') && !pathStr.includes('manifest.json')) return true;
        return false;
      });
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': SKILL_CONTENT,
      });

      await executeAddCommand('github:user/repo', { force: true });

      expect(fs.writeFileSync).toHaveBeenCalled();
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
    });
  });

  describe('option overrides', () => {
    it('should respect --category override', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': SKILL_CONTENT,
      });

      await executeAddCommand('github:user/repo', { category: 'frontend' });

      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('frontend'));
    });

    it('should respect --type override', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': SKILL_CONTENT,
      });

      await executeAddCommand('github:user/repo', { type: 'tool' });

      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('tool'));
    });
  });

  describe('source URL in project manifest', () => {
    it('should store sourceUrl in project manifest entry', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': SKILL_CONTENT,
      });

      await executeAddCommand('github:user/repo', {});

      // Verify writeFileSync was called with manifest.json containing sourceUrl
      const writeFileCalls = vi.mocked(fs.writeFileSync).mock.calls;
      const manifestCall = writeFileCalls.find((call) => String(call[0]).includes('manifest.json'));
      expect(manifestCall).toBeDefined();

      const manifestData = JSON.parse(manifestCall![1] as string) as {
        cognitives: Record<string, { source: string; sourceUrl: string }>;
      };
      const cognitive = Object.values(manifestData.cognitives)[0];
      expect(cognitive).toBeDefined();
      expect(cognitive!.source).toBe('git');
      expect(cognitive!.sourceUrl).toBe('https://github.com/user/repo');
    });
  });

  describe('GitHubInstallError class', () => {
    it('should include repoUrl property', () => {
      const error = new GitHubInstallError('test message', 'https://github.com/user/repo');
      expect(error.message).toBe('test message');
      expect(error.repoUrl).toBe('https://github.com/user/repo');
      expect(error.name).toBe('GitHubInstallError');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('frontmatter parsing', () => {
    it('should use frontmatter metadata for manifest when no manifest.json', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': SKILL_CONTENT,
      });

      await executeAddCommand('github:user/repo', {});

      // Verify the cognitive was saved with frontmatter metadata
      const writeFileCalls = vi.mocked(fs.writeFileSync).mock.calls;
      const manifestCall = writeFileCalls.find((call) => String(call[0]).includes('manifest.json'));
      expect(manifestCall).toBeDefined();

      const manifestData = JSON.parse(manifestCall![1] as string) as {
        cognitives: Record<string, { name: string; version: string }>;
      };
      const cognitive = Object.values(manifestData.cognitives)[0];
      expect(cognitive).toBeDefined();
      expect(cognitive!.name).toBe('my-skill');
      expect(cognitive!.version).toBe('1.0.0');
    });

    it('should fall back to source name when no name in frontmatter', async () => {
      const contentWithoutName = `---
type: skill
version: 1.0.0
---
# No Name Skill`;

      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': contentWithoutName,
      });

      await executeAddCommand('github:user/repo', {});

      // Should use the last part of the repo path as name
      expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installed'));
    });
  });

  describe('auto-sync after install', () => {
    it('should trigger sync and regenerate AGENTS.md after successful install', async () => {
      mockFetchResponses({
        'https://raw.githubusercontent.com/user/repo/main/manifest.json': null,
        'https://raw.githubusercontent.com/user/repo/main/SKILL.md': SKILL_CONTENT,
      });
      mockSync.mockReturnValue({
        providerResults: [
          {
            provider: 'claude',
            created: [{ name: 'my-skill', success: true }],
            skipped: [],
            removed: [],
            errors: [],
          },
        ],
      });

      await executeAddCommand('github:user/repo', {});

      expect(mockSync).toHaveBeenCalled();
      expect(mockRegenerateAgentsMd).toHaveBeenCalled();
    });
  });
});
