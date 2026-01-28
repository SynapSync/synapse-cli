/**
 * Cognitive Scanner
 *
 * Scans the .synapsync directory for cognitives
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { ScannedCognitive, ScanResult, ScanOptions, CognitiveMetadata } from './types.js';
import { parseFrontmatter, extractVersion, extractName } from './parser.js';
import {
  COGNITIVE_TYPES,
  COGNITIVE_FILE_NAMES,
  CATEGORIES,
} from '../../core/constants.js';
import type { CognitiveType, Category } from '../../core/constants.js';
import type { ManifestCognitive } from '../manifest/types.js';

export class CognitiveScanner {
  private synapSyncDir: string;

  constructor(synapSyncDir: string) {
    this.synapSyncDir = synapSyncDir;
  }

  /**
   * Scan the filesystem for cognitives
   */
  scan(options: ScanOptions = {}): ScannedCognitive[] {
    const cognitives: ScannedCognitive[] = [];
    const errors: Array<{ path: string; error: string }> = [];

    const typesToScan = options.types ?? COGNITIVE_TYPES;

    for (const type of typesToScan) {
      const typeDir = path.join(this.synapSyncDir, `${type}s`);

      if (!fs.existsSync(typeDir)) {
        continue;
      }

      // Scan categories
      const categories = this.listDirectories(typeDir);

      for (const category of categories) {
        // Skip if filtering by category and this isn't included
        if (
          options.categories !== undefined &&
          !options.categories.includes(category as Category)
        ) {
          continue;
        }

        const categoryDir = path.join(typeDir, category);
        const cognitiveDirs = this.listDirectories(categoryDir);

        for (const cognitiveDir of cognitiveDirs) {
          try {
            const cognitive = this.scanCognitive(
              path.join(categoryDir, cognitiveDir),
              type,
              category as Category
            );
            if (cognitive !== null) {
              cognitives.push(cognitive);
            }
          } catch (error) {
            errors.push({
              path: path.join(categoryDir, cognitiveDir),
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }
    }

    return cognitives;
  }

  /**
   * Scan a single cognitive directory
   */
  private scanCognitive(
    cognitiveDir: string,
    type: CognitiveType,
    category: Category
  ): ScannedCognitive | null {
    const fileName = COGNITIVE_FILE_NAMES[type];
    const filePath = path.join(cognitiveDir, fileName);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const metadata = parseFrontmatter(content);
    const dirName = path.basename(cognitiveDir);

    const name = extractName(metadata, dirName, content);
    const version = extractVersion(metadata, content);
    const hash = this.computeHash(content);

    return {
      name,
      type,
      category: (metadata.category as Category) ?? category,
      path: cognitiveDir,
      filePath,
      hash,
      metadata: {
        ...metadata,
        name,
        version,
      },
    };
  }

  /**
   * Compare scanned cognitives with manifest and return differences
   */
  compare(
    scanned: ScannedCognitive[],
    manifestCognitives: ManifestCognitive[]
  ): ScanResult {
    const result: ScanResult = {
      found: scanned,
      new: [],
      removed: [],
      modified: [],
      unchanged: 0,
      errors: [],
    };

    // Create map of manifest cognitives
    const manifestMap = new Map<string, ManifestCognitive>();
    for (const cognitive of manifestCognitives) {
      manifestMap.set(cognitive.name, cognitive);
    }

    // Create map of scanned cognitives
    const scannedMap = new Map<string, ScannedCognitive>();
    for (const cognitive of scanned) {
      scannedMap.set(cognitive.name, cognitive);
    }

    // Find new and modified cognitives
    for (const scannedCognitive of scanned) {
      const manifestCognitive = manifestMap.get(scannedCognitive.name);

      if (manifestCognitive === undefined) {
        // New cognitive (in filesystem but not in manifest)
        result.new.push(scannedCognitive);
      } else if (
        manifestCognitive.hash !== undefined &&
        manifestCognitive.hash !== scannedCognitive.hash
      ) {
        // Modified cognitive
        result.modified.push(scannedCognitive);
      } else {
        result.unchanged++;
      }
    }

    // Find removed cognitives (in manifest but not in filesystem)
    for (const manifestCognitive of manifestCognitives) {
      if (!scannedMap.has(manifestCognitive.name)) {
        result.removed.push(manifestCognitive.name);
      }
    }

    return result;
  }

  /**
   * Convert a scanned cognitive to a manifest cognitive
   */
  toManifestCognitive(scanned: ScannedCognitive): ManifestCognitive {
    return {
      name: scanned.name,
      type: scanned.type,
      category: scanned.category,
      version: scanned.metadata.version ?? '1.0.0',
      installedAt: new Date().toISOString(),
      source: 'local',
      hash: scanned.hash,
    };
  }

  /**
   * Compute content hash for change detection
   */
  private computeHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
  }

  /**
   * List directories in a path
   */
  private listDirectories(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) {
      return [];
    }

    return fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .filter((dirent) => !dirent.name.startsWith('.'))
      .map((dirent) => dirent.name);
  }

  /**
   * Detect cognitive type from directory contents
   */
  detectType(cognitiveDir: string): CognitiveType | null {
    for (const type of COGNITIVE_TYPES) {
      const fileName = COGNITIVE_FILE_NAMES[type];
      const filePath = path.join(cognitiveDir, fileName);
      if (fs.existsSync(filePath)) {
        return type;
      }
    }
    return null;
  }

  /**
   * Get cognitive count by type
   */
  countByType(cognitives: ScannedCognitive[]): Record<CognitiveType, number> {
    const counts: Record<CognitiveType, number> = {
      skill: 0,
      agent: 0,
      prompt: 0,
      workflow: 0,
      tool: 0,
    };

    for (const cognitive of cognitives) {
      counts[cognitive.type]++;
    }

    return counts;
  }
}
