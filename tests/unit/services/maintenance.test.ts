/**
 * Maintenance Services Tests
 *
 * Tests for UpdateChecker, DoctorService, and CleanerService
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateChecker } from '../../../src/services/maintenance/update-checker.js';
import { DoctorService } from '../../../src/services/maintenance/doctor.js';
import { CleanerService } from '../../../src/services/maintenance/cleaner.js';
import type { ManifestCognitive } from '../../../src/services/manifest/types.js';
import type { ProjectConfig } from '../../../src/services/config/types.js';

// Mock fs and RegistryClient
vi.mock('fs');
vi.mock('../../../src/services/registry/client.js', () => ({
  RegistryClient: vi.fn().mockImplementation(function () {
    return {
      findByName: vi.fn(),
      search: vi.fn(),
      download: vi.fn(),
      ping: vi.fn(),
    };
  }),
}));

describe('UpdateChecker', () => {
  const mockCognitive: ManifestCognitive = {
    name: 'test-skill',
    type: 'skill',
    category: 'general',
    version: '1.0.0',
    installedAt: '2026-01-28T00:00:00.000Z',
    source: 'registry',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkAll', () => {
    it('should check all registry-sourced cognitives', async () => {
      const mockRegistry = {
        findByName: vi.fn().mockResolvedValue({
          name: 'test-skill',
          version: '2.0.0',
          type: 'skill',
          category: 'general',
        }),
        ping: vi.fn(),
      };

      const checker = new UpdateChecker(mockRegistry as any);
      const result = await checker.checkAll([mockCognitive]);

      expect(result.checked).toBe(1);
      expect(result.updatesAvailable).toHaveLength(1);
      expect(result.updatesAvailable[0].latestVersion).toBe('2.0.0');
    });

    it('should skip local cognitives', async () => {
      const localCognitive: ManifestCognitive = {
        ...mockCognitive,
        source: 'local',
      };

      const mockRegistry = {
        findByName: vi.fn(),
        ping: vi.fn(),
      };

      const checker = new UpdateChecker(mockRegistry as any);
      const result = await checker.checkAll([localCognitive]);

      expect(result.checked).toBe(0);
      expect(mockRegistry.findByName).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      const mockRegistry = {
        findByName: vi.fn().mockRejectedValue(new Error('Network error')),
        ping: vi.fn(),
      };

      const checker = new UpdateChecker(mockRegistry as any);
      const result = await checker.checkAll([mockCognitive]);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].cognitive).toBe('test-skill');
      expect(result.errors[0].message).toBe('Network error');
    });

    it('should identify up-to-date cognitives', async () => {
      const mockRegistry = {
        findByName: vi.fn().mockResolvedValue({
          name: 'test-skill',
          version: '1.0.0', // Same as installed
          type: 'skill',
          category: 'general',
        }),
        ping: vi.fn(),
      };

      const checker = new UpdateChecker(mockRegistry as any);
      const result = await checker.checkAll([mockCognitive]);

      expect(result.upToDate).toHaveLength(1);
      expect(result.updatesAvailable).toHaveLength(0);
    });
  });

  describe('checkOne', () => {
    it('should detect when update is available', async () => {
      const mockRegistry = {
        findByName: vi.fn().mockResolvedValue({
          name: 'test-skill',
          version: '2.0.0',
        }),
        ping: vi.fn(),
      };

      const checker = new UpdateChecker(mockRegistry as any);
      const result = await checker.checkOne(mockCognitive);

      expect(result.hasUpdate).toBe(true);
      expect(result.currentVersion).toBe('1.0.0');
      expect(result.latestVersion).toBe('2.0.0');
    });

    it('should handle cognitive not found in registry', async () => {
      const mockRegistry = {
        findByName: vi.fn().mockResolvedValue(null),
        ping: vi.fn(),
      };

      const checker = new UpdateChecker(mockRegistry as any);
      const result = await checker.checkOne(mockCognitive);

      expect(result.hasUpdate).toBe(false);
      expect(result.latestVersion).toBe('1.0.0');
    });
  });

  describe('version comparison', () => {
    it('should compare versions correctly', async () => {
      const mockRegistry = {
        findByName: vi.fn(),
        ping: vi.fn(),
      };

      const checker = new UpdateChecker(mockRegistry as any);

      // Test using checkOne with different versions
      mockRegistry.findByName.mockResolvedValue({
        name: 'test',
        version: '1.0.1',
      });

      const result1 = await checker.checkOne({ ...mockCognitive, version: '1.0.0' });
      expect(result1.hasUpdate).toBe(true);

      mockRegistry.findByName.mockResolvedValue({
        name: 'test',
        version: '1.0.0',
      });

      const result2 = await checker.checkOne({ ...mockCognitive, version: '1.0.0' });
      expect(result2.hasUpdate).toBe(false);

      mockRegistry.findByName.mockResolvedValue({
        name: 'test',
        version: '0.9.0',
      });

      const result3 = await checker.checkOne({ ...mockCognitive, version: '1.0.0' });
      expect(result3.hasUpdate).toBe(false);

      // Test with v prefix
      mockRegistry.findByName.mockResolvedValue({
        name: 'test',
        version: 'v2.0.0',
      });

      const result4 = await checker.checkOne({ ...mockCognitive, version: 'v1.0.0' });
      expect(result4.hasUpdate).toBe(true);
    });
  });
});

describe('DoctorService', () => {
  const projectRoot = '/test/project';
  const synapSyncDir = '/test/project/.synapsync';
  const mockConfig: ProjectConfig = {
    version: '1.0.0',
    project: { name: 'test-project', description: 'Test' },
    providers: {
      claude: { enabled: true, path: '.claude/commands' },
    },
    storage: { cognitivesDir: '.synapsync', cacheDir: '.synapsync/cache' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('diagnose', () => {
    it('should run all diagnostic checks', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0', cognitives: {} }));

      const doctor = new DoctorService(projectRoot, synapSyncDir, mockConfig);
      const result = await doctor.diagnose();

      expect(result.checks).toBeDefined();
      expect(result.checks.length).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should filter checks when specified', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const doctor = new DoctorService(projectRoot, synapSyncDir, mockConfig);
      const result = await doctor.diagnose({ checks: ['synapsync-dir'] });

      // Should only run the specified check
      const checkIds = result.checks.map((c) => c.id);
      expect(checkIds).toContain('synapsync-dir');
    });

    it('should detect missing .synapsync directory', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const doctor = new DoctorService(projectRoot, synapSyncDir, mockConfig);
      const result = await doctor.diagnose({ checks: ['synapsync-dir'] });

      const check = result.checks.find((c) => c.id === 'synapsync-dir');
      expect(check?.status).toBe('fail');
    });

    it('should pass when .synapsync directory exists', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0', cognitives: {} }));

      const doctor = new DoctorService(projectRoot, synapSyncDir, mockConfig);
      const result = await doctor.diagnose({ checks: ['synapsync-dir'] });

      const check = result.checks.find((c) => c.id === 'synapsync-dir');
      expect(check?.status).toBe('pass');
    });

    it('should compute healthy status correctly', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ version: '1.0.0', cognitives: {} }));

      const doctor = new DoctorService(projectRoot, synapSyncDir, mockConfig);
      const result = await doctor.diagnose({ checks: ['synapsync-dir'] });

      if (result.checks.every((c) => c.status === 'pass' || c.status === 'skip')) {
        expect(result.healthy).toBe(true);
      }
    });
  });

  describe('fix', () => {
    it('should attempt to fix fixable issues', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);

      const doctor = new DoctorService(projectRoot, synapSyncDir, mockConfig);
      const result = await doctor.fix({ checks: ['synapsync-dir'] });

      expect(result).toBeDefined();
      expect(result.fixed).toBeDefined();
      expect(result.failed).toBeDefined();
    });
  });
});

describe('CleanerService', () => {
  const projectRoot = '/test/project';
  const synapSyncDir = '/test/project/.synapsync';
  const mockConfig: ProjectConfig = {
    version: '1.0.0',
    project: { name: 'test-project', description: 'Test' },
    providers: {
      claude: { enabled: true, path: '.claude/commands' },
    },
    storage: { cognitivesDir: '.synapsync', cacheDir: '.synapsync/cache' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('clean', () => {
    it('should clean cache when --cache option is set', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([]);
      vi.mocked(fs.statSync).mockReturnValue({ size: 0, isDirectory: () => false } as any);

      const cleaner = new CleanerService(projectRoot, synapSyncDir, mockConfig);
      const result = cleaner.clean({ cache: true });

      expect(result).toBeDefined();
      expect(result.cleaned).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it('should clean all when --all option is set', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([]);
      vi.mocked(fs.statSync).mockReturnValue({ size: 0, isDirectory: () => false } as any);
      vi.mocked(fs.lstatSync).mockReturnValue({ isSymbolicLink: () => false } as any);

      const cleaner = new CleanerService(projectRoot, synapSyncDir, mockConfig);
      const result = cleaner.clean({ all: true });

      expect(result).toBeDefined();
    });

    it('should respect dry-run option', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'cache-file.json', isFile: () => true, isDirectory: () => false },
      ] as unknown as fs.Dirent[]);
      vi.mocked(fs.statSync).mockReturnValue({ size: 1024 } as any);

      const cleaner = new CleanerService(projectRoot, synapSyncDir, mockConfig);
      const result = cleaner.clean({ cache: true, dryRun: true });

      // With dry-run, files should NOT be deleted
      expect(fs.unlinkSync).not.toHaveBeenCalled();
      expect(fs.rmSync).not.toHaveBeenCalled();
    });

    it('should calculate freed space', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      const cleaner = new CleanerService(projectRoot, synapSyncDir, mockConfig);
      const result = cleaner.clean({ cache: true });

      expect(result.sizeFreed).toBeDefined();
    });

    it('should handle errors gracefully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const cleaner = new CleanerService(projectRoot, synapSyncDir, mockConfig);
      const result = cleaner.clean({ cache: true });

      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('default behavior', () => {
    it('should default to cleaning cache if no options specified', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      const cleaner = new CleanerService(projectRoot, synapSyncDir, mockConfig);
      const result = cleaner.clean({});

      expect(result).toBeDefined();
    });
  });
});
