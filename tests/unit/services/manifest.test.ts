/**
 * ManifestManager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ManifestManager } from '../../../src/services/manifest/manager.js';
import type { ManifestCognitive, SynapSyncManifest } from '../../../src/services/manifest/types.js';

// Mock fs module
vi.mock('fs');

describe('ManifestManager', () => {
  const testDir = '/test/.synapsync';
  const manifestPath = path.join(testDir, 'manifest.json');

  const mockCognitive: ManifestCognitive = {
    name: 'test-skill',
    type: 'skill',
    category: 'general',
    version: '1.0.0',
    installedAt: '2026-01-28T00:00:00.000Z',
    source: 'registry',
    hash: 'abc123',
  };

  const mockManifest: SynapSyncManifest = {
    version: '1.0.0',
    lastUpdated: '2026-01-28T00:00:00.000Z',
    cognitives: {
      'test-skill': mockCognitive,
    },
    syncs: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should load existing manifest from disk', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest));

      const manager = new ManifestManager(testDir);
      const manifest = manager.getManifest();

      expect(fs.existsSync).toHaveBeenCalledWith(manifestPath);
      expect(fs.readFileSync).toHaveBeenCalledWith(manifestPath, 'utf-8');
      expect(manifest.cognitives['test-skill']).toBeDefined();
    });

    it('should create default manifest if file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const manager = new ManifestManager(testDir);
      const manifest = manager.getManifest();

      expect(manifest.version).toBe('1.0.0');
      expect(manifest.cognitives).toEqual({});
      expect(manifest.syncs).toEqual({});
    });

    it('should create default manifest if file is invalid JSON', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue('invalid json');

      const manager = new ManifestManager(testDir);
      const manifest = manager.getManifest();

      expect(manifest.version).toBe('1.0.0');
      expect(manifest.cognitives).toEqual({});
    });
  });

  describe('save', () => {
    it('should save manifest to disk with updated timestamp', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const manager = new ManifestManager(testDir);
      manager.save();

      expect(fs.writeFileSync).toHaveBeenCalledWith(manifestPath, expect.any(String), 'utf-8');

      // Verify the saved content includes lastUpdated
      const savedContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      const parsed = JSON.parse(savedContent);
      expect(parsed.lastUpdated).toBeDefined();
    });
  });

  describe('cognitive operations', () => {
    let manager: ManifestManager;

    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest));
      manager = new ManifestManager(testDir);
    });

    it('should get all cognitives', () => {
      const cognitives = manager.getCognitives();
      expect(cognitives).toHaveLength(1);
      expect(cognitives[0].name).toBe('test-skill');
    });

    it('should get cognitive by name', () => {
      const cognitive = manager.getCognitive('test-skill');
      expect(cognitive).toBeDefined();
      expect(cognitive?.name).toBe('test-skill');
    });

    it('should return undefined for non-existent cognitive', () => {
      const cognitive = manager.getCognitive('non-existent');
      expect(cognitive).toBeUndefined();
    });

    it('should check if cognitive exists', () => {
      expect(manager.hasCognitive('test-skill')).toBe(true);
      expect(manager.hasCognitive('non-existent')).toBe(false);
    });

    it('should add a cognitive', () => {
      const newCognitive: ManifestCognitive = {
        name: 'new-skill',
        type: 'skill',
        category: 'frontend',
        version: '2.0.0',
        installedAt: '2026-01-28T12:00:00.000Z',
        source: 'local',
      };

      manager.addCognitive(newCognitive);

      expect(manager.hasCognitive('new-skill')).toBe(true);
      expect(manager.getCognitive('new-skill')?.version).toBe('2.0.0');
    });

    it('should update a cognitive', () => {
      manager.updateCognitive('test-skill', { version: '2.0.0' });

      const updated = manager.getCognitive('test-skill');
      expect(updated?.version).toBe('2.0.0');
      expect(updated?.name).toBe('test-skill'); // Other fields preserved
    });

    it('should not update non-existent cognitive', () => {
      manager.updateCognitive('non-existent', { version: '2.0.0' });
      expect(manager.getCognitive('non-existent')).toBeUndefined();
    });

    it('should remove a cognitive', () => {
      const result = manager.removeCognitive('test-skill');
      expect(result).toBe(true);
      expect(manager.hasCognitive('test-skill')).toBe(false);
    });

    it('should return false when removing non-existent cognitive', () => {
      const result = manager.removeCognitive('non-existent');
      expect(result).toBe(false);
    });

    it('should get cognitive count', () => {
      expect(manager.getCognitiveCount()).toBe(1);
    });

    it('should get cognitives by type', () => {
      const skills = manager.getCognitivesByType('skill');
      expect(skills).toHaveLength(1);

      const agents = manager.getCognitivesByType('agent');
      expect(agents).toHaveLength(0);
    });

    it('should get cognitives by source', () => {
      const registry = manager.getCognitivesBySource('registry');
      expect(registry).toHaveLength(1);

      const local = manager.getCognitivesBySource('local');
      expect(local).toHaveLength(0);
    });
  });

  describe('reconciliation', () => {
    let manager: ManifestManager;

    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify(mockManifest));
      manager = new ManifestManager(testDir);
    });

    it('should detect added cognitives', () => {
      const scanned: ManifestCognitive[] = [
        mockCognitive,
        {
          name: 'new-skill',
          type: 'skill',
          category: 'frontend',
          version: '1.0.0',
          installedAt: '2026-01-28T00:00:00.000Z',
          source: 'local',
          hash: 'def456',
        },
      ];

      const result = manager.reconcile(scanned);

      expect(result.added).toHaveLength(1);
      expect(result.added[0].name).toBe('new-skill');
      expect(result.removed).toHaveLength(0);
      expect(result.unchanged).toBe(1);
    });

    it('should detect removed cognitives', () => {
      const scanned: ManifestCognitive[] = [];

      const result = manager.reconcile(scanned);

      expect(result.removed).toHaveLength(1);
      expect(result.removed[0]).toBe('test-skill');
      expect(result.added).toHaveLength(0);
    });

    it('should detect updated cognitives', () => {
      const scanned: ManifestCognitive[] = [
        {
          ...mockCognitive,
          hash: 'newhash', // Different hash
        },
      ];

      const result = manager.reconcile(scanned);

      expect(result.updated).toHaveLength(1);
      expect(result.updated[0].name).toBe('test-skill');
      expect(result.added).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
    });

    it('should detect unchanged cognitives', () => {
      const scanned: ManifestCognitive[] = [mockCognitive];

      const result = manager.reconcile(scanned);

      expect(result.unchanged).toBe(1);
      expect(result.added).toHaveLength(0);
      expect(result.removed).toHaveLength(0);
      expect(result.updated).toHaveLength(0);
    });

    it('should apply reconciliation result', () => {
      const newCognitive: ManifestCognitive = {
        name: 'new-skill',
        type: 'agent',
        category: 'backend',
        version: '1.0.0',
        installedAt: '2026-01-28T00:00:00.000Z',
        source: 'github',
        hash: 'xyz789',
      };

      const result = {
        added: [newCognitive],
        removed: ['test-skill'],
        updated: [],
        unchanged: 0,
      };

      manager.applyReconciliation(result);

      expect(manager.hasCognitive('test-skill')).toBe(false);
      expect(manager.hasCognitive('new-skill')).toBe(true);
    });
  });

  describe('provider sync', () => {
    let manager: ManifestManager;

    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      manager = new ManifestManager(testDir);
    });

    it('should set and get provider sync state', () => {
      const syncState = {
        lastSync: '2026-01-28T00:00:00.000Z',
        method: 'symlink' as const,
        cognitives: ['test-skill'],
      };

      manager.setProviderSync('claude', syncState);

      const retrieved = manager.getProviderSync('claude');
      expect(retrieved).toEqual(syncState);
    });

    it('should return undefined for non-synced provider', () => {
      const sync = manager.getProviderSync('openai');
      expect(sync).toBeUndefined();
    });

    it('should get synced cognitives for provider', () => {
      manager.setProviderSync('claude', {
        lastSync: '2026-01-28T00:00:00.000Z',
        method: 'symlink',
        cognitives: ['skill-a', 'skill-b'],
      });

      const cognitives = manager.getSyncedCognitives('claude');
      expect(cognitives).toEqual(['skill-a', 'skill-b']);
    });

    it('should return empty array for non-synced provider', () => {
      const cognitives = manager.getSyncedCognitives('gemini');
      expect(cognitives).toEqual([]);
    });
  });
});
