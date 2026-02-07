/**
 * Sync Engine Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SyncEngine } from '../../../src/services/sync/engine.js';
import type { SyncOptions, SyncProgressCallback, SyncStatus } from '../../../src/services/sync/types.js';
import type { ProjectConfig } from '../../../src/services/config/schema.js';
import type { ScannedCognitive } from '../../../src/services/scanner/types.js';
import type { ManifestCognitive } from '../../../src/services/manifest/types.js';

// ============================================
// Mocks
// ============================================

const mockScan = vi.fn();
const mockCompare = vi.fn();
const mockToManifestCognitive = vi.fn();

vi.mock('../../../src/services/scanner/scanner.js', () => ({
  CognitiveScanner: vi.fn().mockImplementation(function () {
    return { scan: mockScan, compare: mockCompare, toManifestCognitive: mockToManifestCognitive };
  }),
}));

const mockGetCognitives = vi.fn();
const mockGetCognitiveCount = vi.fn();
const mockAddCognitive = vi.fn();
const mockUpdateCognitive = vi.fn();
const mockRemoveCognitive = vi.fn();
const mockSave = vi.fn();
const mockSetProviderSync = vi.fn();

vi.mock('../../../src/services/manifest/manager.js', () => ({
  ManifestManager: vi.fn().mockImplementation(function () {
    return {
      getCognitives: mockGetCognitives,
      getCognitiveCount: mockGetCognitiveCount,
      addCognitive: mockAddCognitive,
      updateCognitive: mockUpdateCognitive,
      removeCognitive: mockRemoveCognitive,
      save: mockSave,
      setProviderSync: mockSetProviderSync,
    };
  }),
}));

const mockSyncProvider = vi.fn();
const mockVerifyProvider = vi.fn();

vi.mock('../../../src/services/symlink/manager.js', () => ({
  SymlinkManager: vi.fn().mockImplementation(function () {
    return {
      syncProvider: mockSyncProvider,
      verifyProvider: mockVerifyProvider,
    };
  }),
}));

// ============================================
// Test Data
// ============================================

const scannedCognitive: ScannedCognitive = {
  name: 'test-skill',
  type: 'skill',
  category: 'general',
  path: '/project/.synapsync/skills/general/test-skill',
  filePath: '/project/.synapsync/skills/general/test-skill/SKILL.md',
  hash: 'abc123',
  metadata: { name: 'test-skill' },
};

const scannedCognitive2: ScannedCognitive = {
  name: 'test-agent',
  type: 'agent',
  category: 'testing',
  path: '/project/.synapsync/agents/testing/test-agent',
  filePath: '/project/.synapsync/agents/testing/test-agent/test-agent.md',
  hash: 'def456',
  metadata: { name: 'test-agent' },
};

const manifestCognitive: ManifestCognitive = {
  name: 'test-skill',
  type: 'skill',
  category: 'general',
  version: '1.0.0',
  installedAt: '2026-01-01T00:00:00.000Z',
  source: 'registry',
};

const mockConfig: ProjectConfig = {
  name: 'test-project',
  version: '1.0.0',
  cli: { theme: 'auto', color: true, verbose: false },
  storage: { dir: '.synapsync' },
  sync: {
    method: 'symlink',
    providers: {
      claude: { enabled: true },
      cursor: { enabled: false },
    },
  },
};

// ============================================
// Tests
// ============================================

describe('SyncEngine', () => {
  let engine: SyncEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCognitives.mockReturnValue([]);
    mockGetCognitiveCount.mockReturnValue(0);
    mockScan.mockReturnValue([]);
    mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 0 });

    engine = new SyncEngine('/project/.synapsync', '/project', mockConfig);
  });

  describe('sync - Phase 1: Scanning', () => {
    it('should scan filesystem for cognitives', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 1 });
      mockGetCognitiveCount.mockReturnValue(1);

      const result = engine.sync({ manifestOnly: true });

      expect(mockScan).toHaveBeenCalledOnce();
      expect(result.success).toBe(true);
    });

    it('should pass type filters to scanner', () => {
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 0 });

      engine.sync({ types: ['skill'], manifestOnly: true });

      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({ types: ['skill'] }));
    });

    it('should pass category filters to scanner', () => {
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 0 });

      engine.sync({ categories: ['general'], manifestOnly: true });

      expect(mockScan).toHaveBeenCalledWith(expect.objectContaining({ categories: ['general'] }));
    });
  });

  describe('sync - Phase 2: Comparing', () => {
    it('should compare scanned cognitives with manifest', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockGetCognitives.mockReturnValue([manifestCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 1 });

      engine.sync({ manifestOnly: true });

      expect(mockCompare).toHaveBeenCalledWith([scannedCognitive], [manifestCognitive]);
    });

    it('should detect new cognitives', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [scannedCognitive], modified: [], removed: [], unchanged: 0 });
      mockToManifestCognitive.mockReturnValue(manifestCognitive);
      mockGetCognitiveCount.mockReturnValue(1);

      const result = engine.sync({ manifestOnly: true });

      expect(result.added).toBe(1);
      expect(result.actions).toHaveLength(1);
      expect(result.actions[0]?.operation).toBe('add');
    });

    it('should detect modified cognitives', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [scannedCognitive], removed: [], unchanged: 0 });
      mockToManifestCognitive.mockReturnValue(manifestCognitive);
      mockGetCognitiveCount.mockReturnValue(1);

      const result = engine.sync({ manifestOnly: true });

      expect(result.updated).toBe(1);
      expect(result.actions[0]?.operation).toBe('update');
    });

    it('should detect removed cognitives', () => {
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: ['old-skill'], unchanged: 0 });
      mockGetCognitiveCount.mockReturnValue(0);

      const result = engine.sync({ manifestOnly: true });

      expect(result.removed).toBe(1);
      expect(result.actions[0]?.operation).toBe('remove');
    });
  });

  describe('sync - Phase 3: Applying changes', () => {
    it('should add new cognitives to manifest', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [scannedCognitive], modified: [], removed: [], unchanged: 0 });
      mockToManifestCognitive.mockReturnValue(manifestCognitive);

      engine.sync({ manifestOnly: true });

      expect(mockAddCognitive).toHaveBeenCalledWith(manifestCognitive);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should update modified cognitives in manifest', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [scannedCognitive], removed: [], unchanged: 0 });
      mockToManifestCognitive.mockReturnValue(manifestCognitive);

      engine.sync({ manifestOnly: true });

      expect(mockUpdateCognitive).toHaveBeenCalledWith('test-skill', manifestCognitive);
    });

    it('should remove deleted cognitives from manifest', () => {
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: ['old-skill'], unchanged: 0 });

      engine.sync({ manifestOnly: true });

      expect(mockRemoveCognitive).toHaveBeenCalledWith('old-skill');
    });

    it('should not apply changes in dry run mode', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [scannedCognitive], modified: [], removed: [], unchanged: 0 });

      const result = engine.sync({ dryRun: true, manifestOnly: true });

      expect(mockAddCognitive).not.toHaveBeenCalled();
      expect(mockSave).not.toHaveBeenCalled();
      expect(result.added).toBe(1);
      expect(result.actions).toHaveLength(1);
    });

    it('should not save when no changes detected', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 1 });

      engine.sync({ manifestOnly: true });

      expect(mockSave).not.toHaveBeenCalled();
    });

    it('should handle errors during action apply', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [scannedCognitive], modified: [], removed: [], unchanged: 0 });
      mockToManifestCognitive.mockImplementation(() => {
        throw new Error('Parse failure');
      });

      const result = engine.sync({ manifestOnly: true });

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe('Parse failure');
    });
  });

  describe('sync - Phase 4: Provider sync', () => {
    it('should sync to enabled providers', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 1 });
      mockSyncProvider.mockReturnValue({
        provider: 'claude',
        created: [],
        skipped: ['test-skill'],
        removed: [],
        errors: [],
        method: 'symlink',
      });

      const result = engine.sync();

      expect(mockSyncProvider).toHaveBeenCalledWith('claude', [scannedCognitive], expect.any(Object));
      expect(result.providerResults).toHaveLength(1);
    });

    it('should not sync disabled providers', () => {
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 0 });

      engine.sync();

      // cursor is disabled in mockConfig, should not be synced
      expect(mockSyncProvider).not.toHaveBeenCalledWith('cursor', expect.anything(), expect.anything());
    });

    it('should filter by specific provider', () => {
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 0 });
      mockSyncProvider.mockReturnValue({
        provider: 'claude',
        created: [],
        skipped: [],
        removed: [],
        errors: [],
        method: 'symlink',
      });

      engine.sync({ provider: 'claude' });

      expect(mockSyncProvider).toHaveBeenCalledOnce();
    });

    it('should skip provider sync when manifestOnly is true', () => {
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 0 });

      const result = engine.sync({ manifestOnly: true });

      expect(mockSyncProvider).not.toHaveBeenCalled();
      expect(result.providerResults).toBeUndefined();
    });

    it('should collect provider errors', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 1 });
      mockSyncProvider.mockReturnValue({
        provider: 'claude',
        created: [],
        skipped: [],
        removed: [],
        errors: [{ path: '/some/path', operation: 'create', message: 'Permission denied' }],
        method: 'symlink',
      });

      const result = engine.sync();

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe('Permission denied');
    });

    it('should update provider sync state in manifest', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 1 });
      mockSyncProvider.mockReturnValue({
        provider: 'claude',
        created: [],
        skipped: ['test-skill'],
        removed: [],
        errors: [],
        method: 'symlink',
      });

      engine.sync();

      expect(mockSetProviderSync).toHaveBeenCalledWith('claude', expect.objectContaining({
        method: 'symlink',
        cognitives: ['test-skill'],
      }));
    });

    it('should not update provider sync state in dry run', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 1 });
      mockSyncProvider.mockReturnValue({
        provider: 'claude',
        created: [],
        skipped: ['test-skill'],
        removed: [],
        errors: [],
        method: 'symlink',
      });

      engine.sync({ dryRun: true });

      expect(mockSetProviderSync).not.toHaveBeenCalled();
    });

    it('should pass copy option to symlink manager', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 1 });
      mockSyncProvider.mockReturnValue({
        provider: 'claude',
        created: [],
        skipped: [],
        removed: [],
        errors: [],
        method: 'copy',
      });

      engine.sync({ copy: true });

      expect(mockSyncProvider).toHaveBeenCalledWith(
        'claude',
        [scannedCognitive],
        expect.objectContaining({ copy: true })
      );
    });
  });

  describe('sync - Result', () => {
    it('should return success when no errors', () => {
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 0 });

      const result = engine.sync({ manifestOnly: true });

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return duration', () => {
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 0 });

      const result = engine.sync({ manifestOnly: true });

      expect(result.duration).toBeGreaterThanOrEqual(0);
    });

    it('should return total from manifest', () => {
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 0 });
      mockGetCognitiveCount.mockReturnValue(5);

      const result = engine.sync({ manifestOnly: true });

      expect(result.total).toBe(5);
    });

    it('should handle scan failure gracefully', () => {
      mockScan.mockImplementation(() => {
        throw new Error('Scan failed');
      });

      const result = engine.sync({ manifestOnly: true });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.code).toBe('SCAN_FAILED');
    });
  });

  describe('sync - Progress callback', () => {
    it('should call progress callback for each phase', () => {
      const phases: string[] = [];
      const onProgress: SyncProgressCallback = (status: SyncStatus) => {
        phases.push(status.phase);
      };

      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [scannedCognitive], modified: [], removed: [], unchanged: 0 });
      mockToManifestCognitive.mockReturnValue(manifestCognitive);

      engine.sync({ manifestOnly: true }, onProgress);

      expect(phases).toContain('scanning');
      expect(phases).toContain('comparing');
      expect(phases).toContain('reconciling');
      expect(phases).toContain('saving');
      expect(phases).toContain('complete');
    });
  });

  describe('preview', () => {
    it('should perform dry run', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockCompare.mockReturnValue({ new: [scannedCognitive], modified: [], removed: [], unchanged: 0 });

      const result = engine.preview();

      expect(mockAddCognitive).not.toHaveBeenCalled();
      expect(result.added).toBe(1);
    });
  });

  describe('getStatus', () => {
    it('should return sync status', () => {
      mockScan.mockReturnValue([scannedCognitive, scannedCognitive2]);
      mockGetCognitives.mockReturnValue([manifestCognitive]);
      mockCompare.mockReturnValue({
        new: [scannedCognitive2],
        modified: [],
        removed: [],
        unchanged: 1,
      });

      const status = engine.getStatus();

      expect(status.manifest).toBe(1);
      expect(status.filesystem).toBe(2);
      expect(status.inSync).toBe(false);
      expect(status.newInFilesystem).toBe(1);
    });

    it('should report in-sync when no changes', () => {
      mockScan.mockReturnValue([scannedCognitive]);
      mockGetCognitives.mockReturnValue([manifestCognitive]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 1 });

      const status = engine.getStatus();

      expect(status.inSync).toBe(true);
    });
  });

  describe('getProviderStatus', () => {
    it('should return provider symlink status', () => {
      mockVerifyProvider.mockReturnValue({
        valid: [{ cognitiveName: 'test-skill' }],
        broken: [],
        orphaned: [{ cognitiveName: 'old-skill' }],
      });

      const status = engine.getProviderStatus('claude');

      expect(status.valid).toBe(1);
      expect(status.broken).toBe(0);
      expect(status.orphaned).toBe(1);
    });
  });

  describe('accessor methods', () => {
    it('should expose manifest manager', () => {
      expect(engine.getManifest()).toBeDefined();
    });

    it('should expose scanner', () => {
      expect(engine.getScanner()).toBeDefined();
    });

    it('should expose symlink manager', () => {
      expect(engine.getSymlinkManager()).toBeDefined();
    });
  });

  describe('constructor defaults', () => {
    it('should derive projectRoot from synapSyncDir when not provided', () => {
      const eng = new SyncEngine('/project/.synapsync');
      expect(eng).toBeDefined();
    });

    it('should handle missing config (no providers)', () => {
      const eng = new SyncEngine('/project/.synapsync', '/project');
      mockScan.mockReturnValue([]);
      mockCompare.mockReturnValue({ new: [], modified: [], removed: [], unchanged: 0 });

      const result = eng.sync();

      // No providers configured means no provider sync
      expect(mockSyncProvider).not.toHaveBeenCalled();
      expect(result.success).toBe(true);
    });
  });
});
