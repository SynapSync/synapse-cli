/**
 * Cognitive Type Detector Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  parseInstallSource,
  detectFromFlag,
  detectFromRegistry,
  detectFromLocalFiles,
  detectFromGitHub,
  detectCognitiveType,
} from '../../../src/services/cognitive/detector.js';

// Mock fs/promises
vi.mock('fs/promises', () => ({
  stat: vi.fn(),
  readdir: vi.fn(),
}));

import * as fs from 'fs/promises';

// Mock global fetch for GitHub tests
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('parseInstallSource', () => {
  describe('registry sources', () => {
    it('should parse simple name as registry', () => {
      const result = parseInstallSource('code-reviewer');

      expect(result.type).toBe('registry');
      expect(result.value).toBe('code-reviewer');
    });

    it('should trim whitespace', () => {
      const result = parseInstallSource('  my-skill  ');

      expect(result.type).toBe('registry');
      expect(result.value).toBe('my-skill');
    });
  });

  describe('local sources', () => {
    it('should parse relative path', () => {
      const result = parseInstallSource('./my-skill');

      expect(result.type).toBe('local');
      expect(result.value).toBe('./my-skill');
    });

    it('should parse absolute path', () => {
      const result = parseInstallSource('/home/user/skills/my-skill');

      expect(result.type).toBe('local');
      expect(result.value).toBe('/home/user/skills/my-skill');
    });

    it('should parse parent directory path', () => {
      const result = parseInstallSource('../other-project/skill');

      expect(result.type).toBe('local');
      expect(result.value).toBe('../other-project/skill');
    });
  });

  describe('GitHub sources', () => {
    it('should parse github: shorthand', () => {
      const result = parseInstallSource('github:owner/repo');

      expect(result.type).toBe('github');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    it('should parse github: with path', () => {
      const result = parseInstallSource('github:owner/repo/skills/my-skill');

      expect(result.type).toBe('github');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
      expect(result.path).toBe('skills/my-skill');
    });

    it('should parse github: with ref', () => {
      const result = parseInstallSource('github:owner/repo#v1.0');

      expect(result.type).toBe('github');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
      expect(result.ref).toBe('v1.0');
    });

    it('should parse github: with path and ref', () => {
      const result = parseInstallSource('github:owner/repo/path/to/skill#develop');

      expect(result.type).toBe('github');
      expect(result.path).toBe('path/to/skill');
      expect(result.ref).toBe('develop');
    });

    it('should parse GitHub URL', () => {
      const result = parseInstallSource('https://github.com/owner/repo');

      expect(result.type).toBe('github');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    it('should parse GitHub URL with tree path', () => {
      const result = parseInstallSource('https://github.com/owner/repo/tree/main/skills/my-skill');

      expect(result.type).toBe('github');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
      expect(result.ref).toBe('main');
      expect(result.path).toBe('skills/my-skill');
    });

    it('should parse GitHub URL with blob path', () => {
      const result = parseInstallSource('https://github.com/owner/repo/blob/main/SKILL.md');

      expect(result.type).toBe('github');
      expect(result.ref).toBe('main');
      expect(result.path).toBe('SKILL.md');
    });

    it('should strip .git suffix from repo', () => {
      const result = parseInstallSource('https://github.com/owner/repo.git');

      expect(result.repo).toBe('repo');
    });
  });

  describe('URL sources', () => {
    it('should parse generic HTTPS URL', () => {
      const result = parseInstallSource('https://example.com/my-skill.tar.gz');

      expect(result.type).toBe('url');
      expect(result.value).toBe('https://example.com/my-skill.tar.gz');
    });

    it('should parse HTTP URL', () => {
      const result = parseInstallSource('http://example.com/skill');

      expect(result.type).toBe('url');
    });
  });
});

describe('detectFromFlag', () => {
  it('should return type from options', () => {
    expect(detectFromFlag({ type: 'skill' })).toBe('skill');
    expect(detectFromFlag({ type: 'agent' })).toBe('agent');
    expect(detectFromFlag({ type: 'prompt' })).toBe('prompt');
    expect(detectFromFlag({ type: 'workflow' })).toBe('workflow');
    expect(detectFromFlag({ type: 'tool' })).toBe('tool');
  });

  it('should return null when no type specified', () => {
    expect(detectFromFlag({})).toBeNull();
  });

  it('should return null for invalid type', () => {
    expect(detectFromFlag({ type: 'invalid' as any })).toBeNull();
  });
});

describe('detectFromRegistry', () => {
  it('should return null (not yet implemented)', async () => {
    const result = await detectFromRegistry({ type: 'registry', value: 'test' });

    expect(result).toBeNull();
  });
});

describe('detectFromLocalFiles', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect SKILL.md in directory', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
    vi.mocked(fs.readdir).mockResolvedValue(['SKILL.md', 'README.md'] as any);

    const result = await detectFromLocalFiles('/path/to/skill');

    expect(result.found).toBe(true);
    expect(result.type).toBe('skill');
    expect(result.fileName).toBe('SKILL.md');
  });

  it('should detect AGENT.md in directory', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
    vi.mocked(fs.readdir).mockResolvedValue(['AGENT.md'] as any);

    const result = await detectFromLocalFiles('/path/to/agent');

    expect(result.found).toBe(true);
    expect(result.type).toBe('agent');
  });

  it('should detect WORKFLOW.yaml in directory', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
    vi.mocked(fs.readdir).mockResolvedValue(['WORKFLOW.yaml'] as any);

    const result = await detectFromLocalFiles('/path/to/workflow');

    expect(result.found).toBe(true);
    expect(result.type).toBe('workflow');
  });

  it('should detect cognitive type from file name directly', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => false } as any);

    const result = await detectFromLocalFiles('/path/to/SKILL.md');

    expect(result.found).toBe(true);
    expect(result.type).toBe('skill');
  });

  it('should return not found for non-cognitive file', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => false } as any);

    const result = await detectFromLocalFiles('/path/to/README.md');

    expect(result.found).toBe(false);
    expect(result.type).toBeNull();
  });

  it('should return not found for empty directory', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
    vi.mocked(fs.readdir).mockResolvedValue([] as any);

    const result = await detectFromLocalFiles('/path/to/empty');

    expect(result.found).toBe(false);
  });

  it('should handle filesystem errors gracefully', async () => {
    vi.mocked(fs.stat).mockRejectedValue(new Error('ENOENT'));

    const result = await detectFromLocalFiles('/nonexistent');

    expect(result.found).toBe(false);
    expect(result.type).toBeNull();
  });
});

describe('detectFromGitHub', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return not found for non-github source', async () => {
    const result = await detectFromGitHub({ type: 'registry', value: 'test' });

    expect(result.found).toBe(false);
  });

  it('should return not found for incomplete github source', async () => {
    const result = await detectFromGitHub({ type: 'github', value: 'test' });

    expect(result.found).toBe(false);
  });

  it('should detect cognitive from GitHub directory listing', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          { name: 'SKILL.md', type: 'file', path: 'skills/SKILL.md' },
          { name: 'README.md', type: 'file', path: 'skills/README.md' },
        ]),
    });

    const result = await detectFromGitHub({
      type: 'github',
      value: 'github:owner/repo',
      owner: 'owner',
      repo: 'repo',
    });

    expect(result.found).toBe(true);
    expect(result.type).toBe('skill');
  });

  it('should detect cognitive from single file response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ name: 'AGENT.md', path: 'agents/AGENT.md' }),
    });

    const result = await detectFromGitHub({
      type: 'github',
      value: 'github:owner/repo/agents/AGENT.md',
      owner: 'owner',
      repo: 'repo',
      path: 'agents/AGENT.md',
    });

    expect(result.found).toBe(true);
    expect(result.type).toBe('agent');
  });

  it('should fall back to master branch when main fails', async () => {
    // First call with main branch fails
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });
    // Second call with master branch succeeds
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ name: 'SKILL.md', type: 'file', path: 'SKILL.md' }]),
    });

    const result = await detectFromGitHub({
      type: 'github',
      value: 'github:owner/repo',
      owner: 'owner',
      repo: 'repo',
    });

    expect(result.found).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should return not found when API call fails', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await detectFromGitHub({
      type: 'github',
      value: 'github:owner/repo',
      owner: 'owner',
      repo: 'repo',
    });

    expect(result.found).toBe(false);
  });

  it('should return not found when no cognitive files in directory', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([
          { name: 'README.md', type: 'file', path: 'README.md' },
          { name: 'package.json', type: 'file', path: 'package.json' },
        ]),
    });

    const result = await detectFromGitHub({
      type: 'github',
      value: 'github:owner/repo',
      owner: 'owner',
      repo: 'repo',
    });

    expect(result.found).toBe(false);
  });
});

describe('detectCognitiveType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect from flag with highest priority', async () => {
    const result = await detectCognitiveType('code-reviewer', { type: 'skill' });

    expect(result.type).toBe('skill');
    expect(result.method).toBe('flag');
    expect(result.confidence).toBe('high');
  });

  it('should attempt registry detection for registry sources', async () => {
    const result = await detectCognitiveType('code-reviewer');

    // Registry not implemented, falls through
    expect(result.source.type).toBe('registry');
  });

  it('should detect from local files', async () => {
    vi.mocked(fs.stat).mockResolvedValue({ isDirectory: () => true } as any);
    vi.mocked(fs.readdir).mockResolvedValue(['AGENT.md'] as any);

    const result = await detectCognitiveType('./my-agent');

    expect(result.type).toBe('agent');
    expect(result.method).toBe('file');
    expect(result.confidence).toBe('high');
  });

  it('should detect from GitHub source', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ name: 'SKILL.md', type: 'file', path: 'SKILL.md' }]),
    });

    const result = await detectCognitiveType('github:owner/repo');

    expect(result.type).toBe('skill');
    expect(result.method).toBe('file');
  });

  it('should return unknown when cannot detect', async () => {
    const result = await detectCognitiveType('unknown-thing');

    expect(result.type).toBeNull();
    expect(result.method).toBe('unknown');
    expect(result.confidence).toBe('low');
  });

  it('should include parsed source in result', async () => {
    const result = await detectCognitiveType('github:owner/repo#v2', { type: 'tool' });

    expect(result.source.type).toBe('github');
    expect(result.source.owner).toBe('owner');
    expect(result.source.ref).toBe('v2');
  });
});
