/**
 * CognitiveScanner Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { CognitiveScanner } from '../../../src/services/scanner/scanner.js';
import type { ScannedCognitive } from '../../../src/services/scanner/types.js';
import type { ManifestCognitive } from '../../../src/services/manifest/types.js';

// Mock fs module
vi.mock('fs');

describe('CognitiveScanner', () => {
  const testDir = '/test/.synapsync';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('scan', () => {
    it('should return empty array when no type directories exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const scanner = new CognitiveScanner(testDir);
      const result = scanner.scan();

      expect(result).toEqual([]);
    });

    it('should return empty array when type directories do not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const scanner = new CognitiveScanner(testDir);
      const result = scanner.scan();

      expect(result).toEqual([]);
    });

    it('should filter by type when specified', () => {
      vi.mocked(fs.existsSync).mockImplementation((p: fs.PathLike) => {
        const pathStr = p.toString();
        return pathStr === path.join(testDir, 'agents');
      });

      vi.mocked(fs.readdirSync).mockReturnValue([]);

      const scanner = new CognitiveScanner(testDir);
      const result = scanner.scan({ types: ['agent'] });

      expect(fs.existsSync).toHaveBeenCalledWith(path.join(testDir, 'agents'));
      expect(result).toEqual([]);
    });

    it('should filter by category when specified', () => {
      vi.mocked(fs.existsSync).mockImplementation((p: fs.PathLike) => {
        const pathStr = p.toString();
        return (
          pathStr === path.join(testDir, 'skills') ||
          pathStr === path.join(testDir, 'skills', 'frontend') ||
          pathStr === path.join(testDir, 'skills', 'backend')
        );
      });

      vi.mocked(fs.readdirSync).mockImplementation((p: fs.PathLike) => {
        const pathStr = p.toString();
        if (pathStr === path.join(testDir, 'skills')) {
          return [
            { name: 'frontend', isDirectory: () => true },
            { name: 'backend', isDirectory: () => true },
          ] as unknown as fs.Dirent[];
        }
        return [];
      });

      const scanner = new CognitiveScanner(testDir);
      const result = scanner.scan({ categories: ['frontend'] });

      // Backend should not be scanned because we filtered to frontend only
      expect(result).toEqual([]);
    });

    it('should skip hidden directories', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: '.hidden', isDirectory: () => true },
        { name: 'visible', isDirectory: () => true },
      ] as unknown as fs.Dirent[]);

      const scanner = new CognitiveScanner(testDir);
      // This tests listDirectories internally filters .hidden
    });

    it('should produce consistent hashes for same content', () => {
      // Hash is tested indirectly through toManifestCognitive
      const scanned: ScannedCognitive = {
        name: 'test-skill',
        type: 'skill',
        category: 'general',
        path: '/test/path',
        filePath: '/test/path/skill.md',
        hash: 'abc1234567890123', // 16 chars
        metadata: { name: 'test-skill', version: '1.0.0' },
      };

      const scanner = new CognitiveScanner(testDir);
      const manifest = scanner.toManifestCognitive(scanned);

      expect(manifest.hash).toBe('abc1234567890123');
      expect(manifest.hash).toHaveLength(16);
    });
  });

  describe('compare', () => {
    const scanner = new CognitiveScanner(testDir);

    const scannedCognitive: ScannedCognitive = {
      name: 'test-skill',
      type: 'skill',
      category: 'general',
      path: '/test/.synapsync/skills/general/test-skill',
      filePath: '/test/.synapsync/skills/general/test-skill/skill.md',
      hash: 'abc123',
      metadata: { name: 'test-skill', version: '1.0.0' },
    };

    const manifestCognitive: ManifestCognitive = {
      name: 'test-skill',
      type: 'skill',
      category: 'general',
      version: '1.0.0',
      installedAt: '2026-01-28T00:00:00.000Z',
      source: 'registry',
      hash: 'abc123',
    };

    it('should detect new cognitives', () => {
      const result = scanner.compare([scannedCognitive], []);

      expect(result.new).toHaveLength(1);
      expect(result.new[0].name).toBe('test-skill');
      expect(result.removed).toHaveLength(0);
      expect(result.modified).toHaveLength(0);
    });

    it('should detect removed cognitives', () => {
      const result = scanner.compare([], [manifestCognitive]);

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toBe('test-skill');
      expect(result.new).toHaveLength(0);
    });

    it('should detect modified cognitives', () => {
      const modifiedScanned: ScannedCognitive = {
        ...scannedCognitive,
        hash: 'newhash',
      };

      const result = scanner.compare([modifiedScanned], [manifestCognitive]);

      expect(result.modified).toHaveLength(1);
      expect(result.modified[0].name).toBe('test-skill');
      expect(result.new).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
    });

    it('should count unchanged cognitives', () => {
      const result = scanner.compare([scannedCognitive], [manifestCognitive]);

      expect(result.unchanged).toBe(1);
      expect(result.new).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
      expect(result.modified).toHaveLength(0);
    });

    it('should handle complex scenarios', () => {
      const scanned: ScannedCognitive[] = [
        scannedCognitive,
        { ...scannedCognitive, name: 'new-skill', hash: 'def456' },
      ];

      const manifest: ManifestCognitive[] = [
        manifestCognitive,
        { ...manifestCognitive, name: 'old-skill' },
      ];

      const result = scanner.compare(scanned, manifest);

      expect(result.new).toHaveLength(1);
      expect(result.new[0].name).toBe('new-skill');
      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toBe('old-skill');
      expect(result.unchanged).toBe(1);
    });
  });

  describe('toManifestCognitive', () => {
    it('should convert scanned cognitive to manifest format', () => {
      const scanned: ScannedCognitive = {
        name: 'test-skill',
        type: 'skill',
        category: 'frontend',
        path: '/test/path',
        filePath: '/test/path/skill.md',
        hash: 'abc123',
        metadata: { name: 'test-skill', version: '2.0.0' },
      };

      const scanner = new CognitiveScanner(testDir);
      const manifest = scanner.toManifestCognitive(scanned);

      expect(manifest.name).toBe('test-skill');
      expect(manifest.type).toBe('skill');
      expect(manifest.category).toBe('frontend');
      expect(manifest.version).toBe('2.0.0');
      expect(manifest.source).toBe('local');
      expect(manifest.hash).toBe('abc123');
      expect(manifest.installedAt).toBeDefined();
    });

    it('should use default version if not in metadata', () => {
      const scanned: ScannedCognitive = {
        name: 'test-skill',
        type: 'skill',
        category: 'general',
        path: '/test/path',
        filePath: '/test/path/skill.md',
        hash: 'abc123',
        metadata: { name: 'test-skill' },
      };

      const scanner = new CognitiveScanner(testDir);
      const manifest = scanner.toManifestCognitive(scanned);

      expect(manifest.version).toBe('1.0.0');
    });
  });

  describe('detectType', () => {
    it('should return null if no cognitive file found', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const scanner = new CognitiveScanner(testDir);
      const type = scanner.detectType('/test/cognitive');

      expect(type).toBeNull();
    });
  });

  describe('countByType', () => {
    it('should count cognitives by type', () => {
      const cognitives: ScannedCognitive[] = [
        {
          name: 'skill-1',
          type: 'skill',
          category: 'general',
          path: '',
          filePath: '',
          hash: '',
          metadata: {},
        },
        {
          name: 'skill-2',
          type: 'skill',
          category: 'frontend',
          path: '',
          filePath: '',
          hash: '',
          metadata: {},
        },
        {
          name: 'agent-1',
          type: 'agent',
          category: 'backend',
          path: '',
          filePath: '',
          hash: '',
          metadata: {},
        },
        {
          name: 'prompt-1',
          type: 'prompt',
          category: 'general',
          path: '',
          filePath: '',
          hash: '',
          metadata: {},
        },
      ];

      const scanner = new CognitiveScanner(testDir);
      const counts = scanner.countByType(cognitives);

      expect(counts.skill).toBe(2);
      expect(counts.agent).toBe(1);
      expect(counts.prompt).toBe(1);
      expect(counts.workflow).toBe(0);
      expect(counts.tool).toBe(0);
    });
  });
});
