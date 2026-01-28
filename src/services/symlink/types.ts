/**
 * Symlink Manager Types
 *
 * Type definitions for the symlink management service
 */

import type { SupportedProvider, CognitiveType } from '../../core/constants.js';

/**
 * Result of creating a single symlink
 */
export interface SymlinkCreateResult {
  success: boolean;
  source: string;
  target: string;
  method: 'symlink' | 'copy';
  error?: string;
}

/**
 * Result of syncing symlinks for a provider
 */
export interface ProviderSyncResult {
  provider: SupportedProvider;
  created: SymlinkCreateResult[];
  skipped: string[]; // Already existed and valid
  removed: string[]; // Orphaned symlinks removed
  errors: SymlinkError[];
  method: 'symlink' | 'copy';
}

/**
 * Error during symlink operation
 */
export interface SymlinkError {
  path: string;
  operation: 'create' | 'remove' | 'verify';
  message: string;
  code?: string;
}

/**
 * Information about an existing symlink or copy
 */
export interface SymlinkInfo {
  path: string;
  target: string;
  exists: boolean;
  isSymlink: boolean;
  isValid: boolean; // Target exists
  cognitiveName: string;
  cognitiveType: CognitiveType;
}

/**
 * Options for symlink operations
 */
export interface SymlinkOptions {
  /** Use copy instead of symlink */
  copy?: boolean;
  /** Force overwrite existing */
  force?: boolean;
  /** Dry run - don't make changes */
  dryRun?: boolean;
}

/**
 * Mapping of cognitive to its symlink paths
 */
export interface CognitiveSymlinkMapping {
  cognitiveName: string;
  cognitiveType: CognitiveType;
  sourcePath: string; // Path in .synapsync
  targetPath: string; // Path in provider directory
}
