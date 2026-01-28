/**
 * Asset Service
 *
 * Handles asset detection, installation, and management
 */

// Types
export type {
  InstallSource,
  InstallSourceType,
  AssetDetectionResult,
  FileDetectionResult,
  AssetRegistryMetadata,
  InstallOptions,
  AssetType,
  Category,
  SupportedProvider,
} from './types.js';

// Detector
export {
  parseInstallSource,
  detectFromFlag,
  detectFromRegistry,
  detectFromLocalFiles,
  detectFromGitHub,
  detectAssetType,
  ASSET_TYPES,
  ASSET_FILE_NAMES,
} from './detector.js';

// Prompter
export {
  promptForAssetType,
  showDetectionResult,
  confirmAssetType,
} from './prompter.js';

// ============================================
// High-level API
// ============================================

import { detectAssetType } from './detector.js';
import { promptForAssetType, showDetectionResult } from './prompter.js';
import type { InstallOptions, AssetType } from './types.js';
import { logger } from '../../utils/logger.js';

/**
 * Result of asset resolution
 */
export interface ResolvedAsset {
  name: string;
  type: AssetType;
  method: string;
  source: {
    type: string;
    value: string;
    owner?: string;
    repo?: string;
    path?: string;
    ref?: string;
  };
}

/**
 * Resolve asset type from source string
 *
 * This is the main entry point for determining what type an asset is.
 * It will:
 * 1. Try auto-detection strategies
 * 2. Fall back to interactive prompt if needed
 * 3. Return the resolved asset with type information
 */
export async function resolveAsset(
  sourceString: string,
  options: InstallOptions = {}
): Promise<ResolvedAsset> {
  // Extract name from source
  const name = extractAssetName(sourceString);

  // Try auto-detection
  const detection = await detectAssetType(sourceString, options);

  let finalType: AssetType;
  let method = detection.method;

  if (detection.type) {
    // Auto-detected successfully
    finalType = detection.type;
    showDetectionResult(name, finalType, method);
  } else {
    // Could not auto-detect, prompt user
    logger.debug(`Auto-detection failed for: ${sourceString}`);
    finalType = await promptForAssetType(name);
    method = 'prompt';
  }

  return {
    name,
    type: finalType,
    method,
    source: detection.source,
  };
}

/**
 * Extract asset name from source string
 */
function extractAssetName(source: string): string {
  const trimmed = source.trim();

  // Local path: get directory/file name
  if (trimmed.startsWith('./') || trimmed.startsWith('/') || trimmed.startsWith('../')) {
    const parts = trimmed.split('/').filter(Boolean);
    return parts[parts.length - 1] ?? trimmed;
  }

  // GitHub: extract from path or repo name
  if (trimmed.startsWith('github:')) {
    const parts = trimmed.slice(7).split('/');
    // If there's a path, use the last part
    if (parts.length > 2) {
      return parts[parts.length - 1]?.split('#')[0] ?? '';
    }
    // Otherwise use repo name
    return parts[1]?.split('#')[0] ?? '';
  }

  // GitHub URL
  if (trimmed.includes('github.com/')) {
    const url = new URL(trimmed);
    const pathParts = url.pathname.split('/').filter(Boolean);
    // Get repo name or path component
    if (pathParts.length > 4) {
      return pathParts[pathParts.length - 1] ?? '';
    }
    return pathParts[1]?.replace(/\.git$/, '') ?? '';
  }

  // Registry name (possibly with version)
  return trimmed.split('@')[0] ?? trimmed;
}
