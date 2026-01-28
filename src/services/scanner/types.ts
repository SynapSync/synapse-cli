/**
 * Scanner Types
 *
 * Type definitions for the cognitive scanner
 */

import type { CognitiveType, Category } from '../../core/constants.js';

/**
 * Metadata extracted from cognitive frontmatter
 */
export interface CognitiveMetadata {
  name?: string;
  version?: string;
  description?: string;
  author?: string | { name: string; email?: string; url?: string };
  license?: string;
  category?: string;
  tags?: string[];
  providers?: string[];
}

/**
 * A cognitive found during filesystem scan
 */
export interface ScannedCognitive {
  name: string;
  type: CognitiveType;
  category: Category;
  /** Directory path containing the cognitive */
  path: string;
  /** Full path to the cognitive file */
  filePath: string;
  /** Original filename (e.g., "feature-branch-manager.md") */
  fileName?: string;
  hash: string;
  metadata: CognitiveMetadata;
}

/**
 * Result of scanning the filesystem
 */
export interface ScanResult {
  /** All cognitives found in filesystem */
  found: ScannedCognitive[];
  /** Cognitives in filesystem but not in manifest */
  new: ScannedCognitive[];
  /** Cognitives in manifest but not in filesystem */
  removed: string[];
  /** Cognitives that have been modified (hash changed) */
  modified: ScannedCognitive[];
  /** Count of unchanged cognitives */
  unchanged: number;
  /** Any errors encountered during scan */
  errors: Array<{ path: string; error: string }>;
}

/**
 * Scanner options
 */
export interface ScanOptions {
  /** Include hidden directories */
  includeHidden?: boolean;
  /** Types to scan for (default: all) */
  types?: CognitiveType[];
  /** Categories to scan for (default: all) */
  categories?: Category[];
}
