/**
 * Cognitive Type Detector
 *
 * Detects the type of a cognitive using multiple strategies:
 * 1. Explicit flag (--type)
 * 2. Registry lookup
 * 3. File detection (SKILL.md, AGENT.md, etc.)
 * 4. Interactive prompt (fallback)
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { COGNITIVE_TYPES, COGNITIVE_FILE_NAMES } from '../../core/constants.js';
import type { CognitiveType } from '../../core/constants.js';
import type {
  InstallSource,
  CognitiveDetectionResult,
  FileDetectionResult,
  CognitiveRegistryMetadata,
  InstallOptions,
} from './types.js';

// ============================================
// Source Parser
// ============================================

/**
 * Parse installation source string into structured format
 *
 * Supported formats:
 * - "code-reviewer" → registry
 * - "./local-path" or "/absolute/path" → local
 * - "github:owner/repo" → github
 * - "github:owner/repo/path/to/asset" → github with path
 * - "github:owner/repo#branch" → github with ref
 * - "https://github.com/owner/repo" → github (URL)
 */
export function parseInstallSource(source: string): InstallSource {
  const trimmed = source.trim();

  // Local path (starts with . or /)
  if (trimmed.startsWith('./') || trimmed.startsWith('/') || trimmed.startsWith('../')) {
    return {
      type: 'local',
      value: trimmed,
    };
  }

  // GitHub shorthand: github:owner/repo or github:owner/repo/path#ref
  if (trimmed.startsWith('github:')) {
    return parseGitHubSource(trimmed.slice(7));
  }

  // GitHub URL: https://github.com/owner/repo
  if (trimmed.includes('github.com/')) {
    return parseGitHubUrl(trimmed);
  }

  // Generic URL
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return {
      type: 'url',
      value: trimmed,
    };
  }

  // Default: registry name
  return {
    type: 'registry',
    value: trimmed,
  };
}

/**
 * Parse GitHub shorthand format
 * Format: owner/repo[/path][#ref]
 */
function parseGitHubSource(source: string): InstallSource {
  let remaining = source;
  let ref: string | undefined;

  // Extract ref (branch/tag) if present
  const refIndex = remaining.indexOf('#');
  if (refIndex !== -1) {
    ref = remaining.slice(refIndex + 1);
    remaining = remaining.slice(0, refIndex);
  }

  const parts = remaining.split('/');
  const owner = parts[0];
  const repo = parts[1];
  const assetPath = parts.length > 2 ? parts.slice(2).join('/') : undefined;

  const result: InstallSource = {
    type: 'github',
    value: source,
  };
  if (owner !== undefined) result.owner = owner;
  if (repo !== undefined) result.repo = repo;
  if (assetPath !== undefined) result.path = assetPath;
  if (ref !== undefined) result.ref = ref;
  return result;
}

/**
 * Parse GitHub URL format
 * Formats:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/tree/branch/path
 * - https://github.com/owner/repo/blob/branch/path/file
 */
function parseGitHubUrl(url: string): InstallSource {
  const urlObj = new URL(url);
  const pathParts = urlObj.pathname.split('/').filter(Boolean);

  const owner = pathParts[0];
  const repo = pathParts[1]?.replace(/\.git$/, '');

  let ref: string | undefined;
  let assetPath: string | undefined;

  // Check for /tree/branch/path or /blob/branch/path format
  if (pathParts[2] === 'tree' || pathParts[2] === 'blob') {
    ref = pathParts[3];
    if (pathParts.length > 4) {
      assetPath = pathParts.slice(4).join('/');
    }
  }

  const result: InstallSource = {
    type: 'github',
    value: url,
  };
  if (owner !== undefined) result.owner = owner;
  if (repo !== undefined) result.repo = repo;
  if (assetPath !== undefined) result.path = assetPath;
  if (ref !== undefined) result.ref = ref;
  return result;
}

// ============================================
// Detection Strategies
// ============================================

/**
 * Strategy 1: Detect from explicit flag
 */
export function detectFromFlag(options: InstallOptions): CognitiveType | null {
  if (options.type && COGNITIVE_TYPES.includes(options.type)) {
    return options.type;
  }
  return null;
}

/**
 * Strategy 2: Detect from registry metadata
 * Returns metadata if found, null if not in registry
 */
export function detectFromRegistry(
  _source: InstallSource
): Promise<CognitiveRegistryMetadata | null> {
  // TODO: Implement actual registry lookup
  // For now, return null (registry not implemented yet)
  //
  // Future implementation:
  // if (source.type !== 'registry') return null;
  // const response = await registryClient.getCognitive(source.value);
  // return response;

  return Promise.resolve(null);
}

/**
 * Strategy 3: Detect from local file system
 * Scans directory for known cognitive files (SKILL.md, AGENT.md, etc.)
 */
export async function detectFromLocalFiles(dirPath: string): Promise<FileDetectionResult> {
  try {
    const resolvedPath = path.resolve(dirPath);
    const stats = await fs.stat(resolvedPath);

    if (!stats.isDirectory()) {
      // If it's a file, check if it's a known cognitive file
      const fileName = path.basename(resolvedPath);
      const cognitiveType = getCognitiveTypeFromFileName(fileName);

      if (cognitiveType) {
        return {
          found: true,
          type: cognitiveType,
          fileName,
          filePath: resolvedPath,
        };
      }

      return { found: false, type: null, fileName: null, filePath: null };
    }

    // It's a directory, scan for cognitive files
    const files = await fs.readdir(resolvedPath);

    for (const cognitiveType of COGNITIVE_TYPES) {
      const expectedFile = COGNITIVE_FILE_NAMES[cognitiveType];
      if (files.includes(expectedFile)) {
        return {
          found: true,
          type: cognitiveType,
          fileName: expectedFile,
          filePath: path.join(resolvedPath, expectedFile),
        };
      }
    }

    return { found: false, type: null, fileName: null, filePath: null };
  } catch {
    return { found: false, type: null, fileName: null, filePath: null };
  }
}

/**
 * Strategy 4: Detect from GitHub repository
 * Fetches file list from GitHub API and checks for cognitive files
 */
export async function detectFromGitHub(source: InstallSource): Promise<FileDetectionResult> {
  if (source.type !== 'github' || !source.owner || !source.repo) {
    return { found: false, type: null, fileName: null, filePath: null };
  }

  try {
    const ref = source.ref ?? 'main';
    const basePath = source.path ?? '';

    // Build GitHub API URL for contents
    const apiUrl = `https://api.github.com/repos/${source.owner}/${source.repo}/contents/${basePath}?ref=${ref}`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'SynapSync-CLI',
      },
    });

    if (!response.ok) {
      // Try with 'master' branch if 'main' failed
      if (ref === 'main') {
        const masterSource = { ...source, ref: 'master' };
        return detectFromGitHub(masterSource);
      }
      return { found: false, type: null, fileName: null, filePath: null };
    }

    const contents = (await response.json()) as Array<{ name: string; type: string; path: string }>;

    // Check if response is an array (directory listing)
    if (!Array.isArray(contents)) {
      // It might be a single file
      const singleFile = contents as { name: string; path: string };
      const cognitiveType = getCognitiveTypeFromFileName(singleFile.name);
      if (cognitiveType) {
        return {
          found: true,
          type: cognitiveType,
          fileName: singleFile.name,
          filePath: singleFile.path,
        };
      }
      return { found: false, type: null, fileName: null, filePath: null };
    }

    // Search for cognitive files in directory
    for (const cognitiveType of COGNITIVE_TYPES) {
      const expectedFile = COGNITIVE_FILE_NAMES[cognitiveType];
      const found = contents.find((item) => item.name === expectedFile);

      if (found) {
        return {
          found: true,
          type: cognitiveType,
          fileName: expectedFile,
          filePath: found.path,
        };
      }
    }

    return { found: false, type: null, fileName: null, filePath: null };
  } catch {
    return { found: false, type: null, fileName: null, filePath: null };
  }
}

/**
 * Get cognitive type from file name
 */
function getCognitiveTypeFromFileName(fileName: string): CognitiveType | null {
  for (const cognitiveType of COGNITIVE_TYPES) {
    if (COGNITIVE_FILE_NAMES[cognitiveType] === fileName) {
      return cognitiveType;
    }
  }
  return null;
}

// ============================================
// Main Detection Function
// ============================================

/**
 * Detect cognitive type using all available strategies
 *
 * Order of evaluation:
 * 1. Explicit flag (--type) - highest priority
 * 2. Registry metadata
 * 3. File detection (local or GitHub)
 * 4. Returns null if cannot detect (caller should prompt user)
 */
export async function detectCognitiveType(
  sourceString: string,
  options: InstallOptions = {}
): Promise<CognitiveDetectionResult> {
  const source = parseInstallSource(sourceString);

  // Strategy 1: Check explicit flag
  const flagType = detectFromFlag(options);
  if (flagType) {
    return {
      type: flagType,
      method: 'flag',
      confidence: 'high',
      source,
    };
  }

  // Strategy 2: Check registry (for registry sources)
  if (source.type === 'registry') {
    const registryMeta = await detectFromRegistry(source);
    if (registryMeta) {
      return {
        type: registryMeta.type,
        method: 'registry',
        confidence: 'high',
        source,
        metadata: registryMeta,
      };
    }
  }

  // Strategy 3: File detection based on source type
  let fileResult: FileDetectionResult = {
    found: false,
    type: null,
    fileName: null,
    filePath: null,
  };

  if (source.type === 'local') {
    fileResult = await detectFromLocalFiles(source.value);
  } else if (source.type === 'github') {
    fileResult = await detectFromGitHub(source);
  }

  if (fileResult.found && fileResult.type) {
    return {
      type: fileResult.type,
      method: 'file',
      confidence: 'high',
      source,
    };
  }

  // Could not detect - caller should prompt user
  return {
    type: null,
    method: 'unknown',
    confidence: 'low',
    source,
  };
}

// ============================================
// Utility Exports
// ============================================

export { COGNITIVE_TYPES, COGNITIVE_FILE_NAMES };
