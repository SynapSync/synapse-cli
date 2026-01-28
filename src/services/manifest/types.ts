/**
 * Manifest Types
 *
 * Type definitions for the SynapSync manifest.json file
 */

import type { CognitiveType, Category, SupportedProvider } from '../../core/constants.js';

/**
 * Installed cognitive entry in the manifest
 */
export interface ManifestCognitive {
  name: string;
  type: CognitiveType;
  category: Category;
  version: string;
  installedAt: string;
  source: 'registry' | 'local' | 'github';
  sourceUrl?: string;
  hash?: string;
}

/**
 * Provider sync state
 */
export interface ProviderSyncState {
  lastSync: string;
  method: 'symlink' | 'copy';
  cognitives: string[];
}

/**
 * The main manifest structure
 */
export interface SynapSyncManifest {
  version: string;
  lastUpdated: string;
  cognitives: Record<string, ManifestCognitive>;
  syncs: Partial<Record<SupportedProvider, ProviderSyncState>>;
}

/**
 * Default empty manifest
 */
export const DEFAULT_MANIFEST: SynapSyncManifest = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  cognitives: {},
  syncs: {},
};

/**
 * Manifest reconciliation result
 */
export interface ReconciliationResult {
  added: ManifestCognitive[];
  removed: string[];
  updated: ManifestCognitive[];
  unchanged: number;
}
