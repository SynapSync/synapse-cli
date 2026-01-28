/**
 * Asset service types
 */

import type { AssetType, Category, SupportedProvider } from '../../core/constants.js';

// ============================================
// Installation Source Types
// ============================================

/**
 * Types of installation sources
 */
export type InstallSourceType = 'registry' | 'local' | 'github' | 'url';

/**
 * Parsed installation source
 */
export interface InstallSource {
  type: InstallSourceType;
  value: string;
  owner?: string; // For GitHub: owner
  repo?: string; // For GitHub: repo name
  path?: string; // For GitHub: path within repo
  ref?: string; // For GitHub: branch/tag/commit
}

// ============================================
// Detection Result Types
// ============================================

/**
 * How the asset type was detected
 */
export type DetectionMethod =
  | 'flag' // User provided --type flag
  | 'registry' // Found in registry metadata
  | 'file' // Detected by file name (SKILL.md, AGENT.md, etc.)
  | 'prompt' // User selected via interactive prompt
  | 'unknown'; // Could not detect

/**
 * Result of asset type detection
 */
export interface AssetDetectionResult {
  type: AssetType | null;
  method: DetectionMethod;
  confidence: 'high' | 'medium' | 'low';
  source: InstallSource;
  metadata?: AssetRegistryMetadata;
}

// ============================================
// Registry Types
// ============================================

/**
 * Metadata returned from registry for an asset
 */
export interface AssetRegistryMetadata {
  name: string;
  type: AssetType;
  version: string;
  category: Category;
  description: string;
  author?: string;
  tags?: string[];
  providers?: SupportedProvider[];
  downloads?: number;
  stars?: number;
  repository?: string;
}

// ============================================
// File Detection Types
// ============================================

/**
 * Result of scanning a directory for asset files
 */
export interface FileDetectionResult {
  found: boolean;
  type: AssetType | null;
  fileName: string | null;
  filePath: string | null;
}

// ============================================
// Install Options
// ============================================

/**
 * Options for install command
 */
export interface InstallOptions {
  type?: AssetType; // Explicit type from --type flag
  category?: Category; // Explicit category from --category flag
  version?: string; // Specific version to install
  global?: boolean; // Install globally
  force?: boolean; // Force reinstall
  skipDeps?: boolean; // Skip dependencies
}

// ============================================
// Re-exports
// ============================================

export type { AssetType, Category, SupportedProvider };
