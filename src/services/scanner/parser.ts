/**
 * Frontmatter Parser
 *
 * Parse YAML frontmatter from cognitive files
 */

import type { CognitiveMetadata } from './types.js';

/**
 * Parse YAML frontmatter from a markdown file content
 */
export function parseFrontmatter(content: string): CognitiveMetadata {
  // Match YAML frontmatter between ---
  const match = content.match(/^---\n([\s\S]*?)\n---/);

  if (match?.[1] === undefined) {
    return {};
  }

  try {
    return parseYaml(match[1]);
  } catch {
    return {};
  }
}

/**
 * Simple YAML parser for frontmatter
 * Handles basic key: value, arrays, and nested objects
 */
function parseYaml(yaml: string): CognitiveMetadata {
  const result: CognitiveMetadata = {};
  const lines = yaml.split('\n');

  let currentKey: string | null = null;
  let currentArray: string[] | null = null;

  for (const line of lines) {
    // Skip empty lines and comments
    if (line.trim() === '' || line.trim().startsWith('#')) {
      continue;
    }

    // Check for array item
    if (line.match(/^\s+-\s+/)) {
      const value = line.replace(/^\s+-\s+/, '').trim();
      if (currentArray !== null) {
        currentArray.push(cleanValue(value));
      }
      continue;
    }

    // Check for key: value
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const rawValue = line.slice(colonIndex + 1).trim();

      // Save previous array if exists
      if (currentKey !== null && currentArray !== null) {
        setNestedValue(result, currentKey, currentArray);
        currentArray = null;
      }

      currentKey = key;

      if (rawValue === '' || rawValue === '|' || rawValue === '>') {
        // Start of array or multiline
        currentArray = [];
      } else if (rawValue.startsWith('[') && rawValue.endsWith(']')) {
        // Inline array
        const arrayContent = rawValue.slice(1, -1);
        const items = arrayContent.split(',').map((item) => cleanValue(item.trim()));
        setNestedValue(result, key, items);
        currentKey = null;
      } else {
        // Simple value
        setNestedValue(result, key, cleanValue(rawValue));
        currentKey = null;
      }
    }
  }

  // Save final array if exists
  if (currentKey !== null && currentArray !== null) {
    setNestedValue(result, currentKey, currentArray);
  }

  return result;
}

/**
 * Clean a YAML value (remove quotes, handle booleans, etc.)
 */
function cleanValue(value: string): string {
  // Remove surrounding quotes
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/**
 * Set a value in the result object, supporting nested keys
 */
function setNestedValue(obj: CognitiveMetadata, key: string, value: unknown): void {
  // For now, just set flat keys
  // Could be extended to support nested objects like author.name
  (obj as Record<string, unknown>)[key] = value;
}

/**
 * Extract version from frontmatter or content
 */
export function extractVersion(metadata: CognitiveMetadata, content: string): string {
  // Check frontmatter first
  if (metadata.version !== undefined) {
    return metadata.version;
  }

  // Try to find version in content
  const versionMatch = content.match(/version:\s*['"]?([0-9]+\.[0-9]+\.[0-9]+)['"]?/i);
  if (versionMatch?.[1] !== undefined) {
    return versionMatch[1];
  }

  return '1.0.0';
}

/**
 * Extract name from frontmatter, directory, or content
 */
export function extractName(metadata: CognitiveMetadata, dirName: string, content: string): string {
  // Check frontmatter first
  if (metadata.name !== undefined) {
    return metadata.name;
  }

  // Try to find name in content (# Title)
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch?.[1] !== undefined) {
    // Convert title to kebab-case
    return titleMatch[1]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Fall back to directory name
  return dirName;
}
