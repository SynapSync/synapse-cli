/**
 * Sync Engine Types
 *
 * Type definitions for the synchronization engine
 */

import type { CognitiveType, Category, SupportedProvider } from '../../core/constants.js';
import type { ScannedCognitive } from '../scanner/types.js';
import type { ManifestCognitive } from '../manifest/types.js';
import type { ProviderSyncResult } from '../symlink/types.js';

/**
 * Sync operation type
 */
export type SyncOperation = 'add' | 'remove' | 'update';

/**
 * A single sync action to be performed
 */
export interface SyncAction {
  operation: SyncOperation;
  cognitive: ScannedCognitive | ManifestCognitive | string;
  reason: string;
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  /** Whether sync was successful */
  success: boolean;
  /** Number of cognitives added to manifest */
  added: number;
  /** Number of cognitives removed from manifest */
  removed: number;
  /** Number of cognitives updated in manifest */
  updated: number;
  /** Number of unchanged cognitives */
  unchanged: number;
  /** Total cognitives in manifest after sync */
  total: number;
  /** Errors encountered during sync */
  errors: SyncError[];
  /** Actions that were performed */
  actions: SyncAction[];
  /** Duration in milliseconds */
  duration: number;
  /** Provider sync results (Phase 2) */
  providerResults?: ProviderSyncResult[];
}

/**
 * Error during sync
 */
export interface SyncError {
  cognitive?: string;
  message: string;
  code: SyncErrorCode;
}

/**
 * Sync error codes
 */
export type SyncErrorCode =
  | 'SCAN_FAILED'
  | 'MANIFEST_READ_FAILED'
  | 'MANIFEST_WRITE_FAILED'
  | 'COGNITIVE_PARSE_FAILED'
  | 'UNKNOWN';

/**
 * Sync options
 */
export interface SyncOptions {
  /** Perform a dry run without making changes */
  dryRun?: boolean;
  /** Types to sync (default: all) */
  types?: CognitiveType[];
  /** Categories to sync (default: all) */
  categories?: Category[];
  /** Force sync even if no changes detected */
  force?: boolean;
  /** Verbose output */
  verbose?: boolean;
  /** Sync only to specific provider */
  provider?: SupportedProvider;
  /** Use copy instead of symlinks */
  copy?: boolean;
  /** Skip provider sync (manifest only) */
  manifestOnly?: boolean;
}

/**
 * Sync status for display
 */
export interface SyncStatus {
  /** Current phase of sync */
  phase: 'scanning' | 'comparing' | 'reconciling' | 'saving' | 'complete';
  /** Progress message */
  message: string;
  /** Current item being processed */
  current?: string;
  /** Total items to process */
  total?: number;
  /** Items processed so far */
  processed?: number;
}

/**
 * Callback for sync progress updates
 */
export type SyncProgressCallback = (status: SyncStatus) => void;
