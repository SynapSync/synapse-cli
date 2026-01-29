/**
 * Manifest Manager
 *
 * Service for reading, writing, and managing the manifest.json file
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  SynapSyncManifest,
  ManifestCognitive,
  ProviderSyncState,
  ReconciliationResult,
} from './types.js';
import { DEFAULT_MANIFEST } from './types.js';
import type { SupportedProvider } from '../../core/constants.js';

export class ManifestManager {
  private manifestPath: string;
  private manifest: SynapSyncManifest;

  constructor(synapSyncDir: string) {
    this.manifestPath = path.join(synapSyncDir, 'manifest.json');
    this.manifest = this.load();
  }

  /**
   * Load manifest from disk
   */
  private load(): SynapSyncManifest {
    if (!fs.existsSync(this.manifestPath)) {
      return { ...DEFAULT_MANIFEST };
    }

    try {
      const content = fs.readFileSync(this.manifestPath, 'utf-8');
      const parsed = JSON.parse(content) as SynapSyncManifest;

      // Ensure all required fields exist
      return {
        version: parsed.version ?? DEFAULT_MANIFEST.version,
        lastUpdated: parsed.lastUpdated ?? DEFAULT_MANIFEST.lastUpdated,
        cognitives: parsed.cognitives ?? {},
        syncs: parsed.syncs ?? {},
      };
    } catch {
      return { ...DEFAULT_MANIFEST };
    }
  }

  /**
   * Save manifest to disk
   */
  save(): void {
    this.manifest.lastUpdated = new Date().toISOString();
    const content = JSON.stringify(this.manifest, null, 2);
    fs.writeFileSync(this.manifestPath, content, 'utf-8');
  }

  /**
   * Get the current manifest
   */
  getManifest(): SynapSyncManifest {
    return this.manifest;
  }

  /**
   * Get all cognitives from manifest
   */
  getCognitives(): ManifestCognitive[] {
    return Object.values(this.manifest.cognitives);
  }

  /**
   * Get a specific cognitive by name
   */
  getCognitive(name: string): ManifestCognitive | undefined {
    return this.manifest.cognitives[name];
  }

  /**
   * Check if a cognitive exists in manifest
   */
  hasCognitive(name: string): boolean {
    return this.manifest.cognitives[name] !== undefined;
  }

  /**
   * Add a cognitive to manifest
   */
  addCognitive(cognitive: ManifestCognitive): void {
    this.manifest.cognitives[cognitive.name] = cognitive;
  }

  /**
   * Update a cognitive in manifest
   */
  updateCognitive(name: string, updates: Partial<ManifestCognitive>): void {
    const existing = this.manifest.cognitives[name];
    if (existing !== undefined) {
      this.manifest.cognitives[name] = { ...existing, ...updates };
    }
  }

  /**
   * Remove a cognitive from manifest
   */
  removeCognitive(name: string): boolean {
    if (this.manifest.cognitives[name] !== undefined) {
      delete this.manifest.cognitives[name];
      return true;
    }
    return false;
  }

  /**
   * Reconcile manifest with scanned cognitives
   * Returns what was added, removed, and updated
   */
  reconcile(scannedCognitives: ManifestCognitive[]): ReconciliationResult {
    const result: ReconciliationResult = {
      added: [],
      removed: [],
      updated: [],
      unchanged: 0,
    };

    // Create a map of scanned cognitives for quick lookup
    const scannedMap = new Map<string, ManifestCognitive>();
    for (const cognitive of scannedCognitives) {
      scannedMap.set(cognitive.name, cognitive);
    }

    // Find removed cognitives (in manifest but not in filesystem)
    for (const name of Object.keys(this.manifest.cognitives)) {
      if (!scannedMap.has(name)) {
        result.removed.push(name);
      }
    }

    // Find added and updated cognitives
    for (const scanned of scannedCognitives) {
      const existing = this.manifest.cognitives[scanned.name];

      if (existing === undefined) {
        // New cognitive
        result.added.push(scanned);
      } else if (scanned.hash !== undefined && existing.hash !== scanned.hash) {
        // Modified cognitive
        result.updated.push(scanned);
      } else {
        result.unchanged++;
      }
    }

    return result;
  }

  /**
   * Apply reconciliation result to manifest
   */
  applyReconciliation(result: ReconciliationResult): void {
    // Remove deleted cognitives
    for (const name of result.removed) {
      delete this.manifest.cognitives[name];
    }

    // Add new cognitives
    for (const cognitive of result.added) {
      this.manifest.cognitives[cognitive.name] = cognitive;
    }

    // Update modified cognitives
    for (const cognitive of result.updated) {
      const existing = this.manifest.cognitives[cognitive.name];
      if (existing !== undefined) {
        const updated: ManifestCognitive = {
          ...existing,
          ...cognitive,
          // Keep original installation info
          installedAt: existing.installedAt,
          source: existing.source,
        };
        if (existing.sourceUrl !== undefined) {
          updated.sourceUrl = existing.sourceUrl;
        }
        this.manifest.cognitives[cognitive.name] = updated;
      }
    }
  }

  /**
   * Get provider sync state
   */
  getProviderSync(provider: SupportedProvider): ProviderSyncState | undefined {
    return this.manifest.syncs[provider];
  }

  /**
   * Update provider sync state
   */
  setProviderSync(provider: SupportedProvider, state: ProviderSyncState): void {
    this.manifest.syncs[provider] = state;
  }

  /**
   * Get all synced cognitives for a provider
   */
  getSyncedCognitives(provider: SupportedProvider): string[] {
    return this.manifest.syncs[provider]?.cognitives ?? [];
  }

  /**
   * Get cognitive count
   */
  getCognitiveCount(): number {
    return Object.keys(this.manifest.cognitives).length;
  }

  /**
   * Get cognitives by type
   */
  getCognitivesByType(type: string): ManifestCognitive[] {
    return Object.values(this.manifest.cognitives).filter((c) => c.type === type);
  }

  /**
   * Get cognitives by source
   */
  getCognitivesBySource(source: 'registry' | 'local' | 'github'): ManifestCognitive[] {
    return Object.values(this.manifest.cognitives).filter((c) => c.source === source);
  }
}
