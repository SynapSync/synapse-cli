/**
 * Cleaner Service
 *
 * Cleans cache, orphaned symlinks, and temp files
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  CleanResult,
  CleanedItem,
  CleanError,
  CleanOptions,
} from './types.js';
import { SymlinkManager } from '../symlink/manager.js';
import type { ProjectConfig } from '../config/schema.js';
import type { SupportedProvider } from '../../core/constants.js';

export class CleanerService {
  private projectRoot: string;
  private synapSyncDir: string;
  private config: ProjectConfig | null;

  constructor(projectRoot: string, synapSyncDir: string, config?: ProjectConfig) {
    this.projectRoot = projectRoot;
    this.synapSyncDir = synapSyncDir;
    this.config = config ?? null;
  }

  /**
   * Clean based on options
   */
  clean(options: CleanOptions = {}): CleanResult {
    const startTime = Date.now();
    const result: CleanResult = {
      success: true,
      cleaned: [],
      bytesFreed: 0,
      sizeFreed: '0 B',
      errors: [],
      duration: 0,
    };

    // If --all, enable everything
    if (options.all === true) {
      options.cache = true;
      options.orphans = true;
      options.temp = true;
    }

    // Default to cache if nothing specified
    if (!options.cache && !options.orphans && !options.temp) {
      options.cache = true;
    }

    // Clean cache
    if (options.cache === true) {
      const cacheResult = this.cleanCache(options.dryRun);
      result.cleaned.push(...cacheResult.cleaned);
      result.bytesFreed += cacheResult.bytes;
      result.errors.push(...cacheResult.errors);
    }

    // Clean orphaned symlinks
    if (options.orphans === true) {
      const orphanResult = this.cleanOrphans(options.dryRun);
      result.cleaned.push(...orphanResult.cleaned);
      result.errors.push(...orphanResult.errors);
    }

    // Clean temp files
    if (options.temp === true) {
      const tempResult = this.cleanTemp(options.dryRun);
      result.cleaned.push(...tempResult.cleaned);
      result.bytesFreed += tempResult.bytes;
      result.errors.push(...tempResult.errors);
    }

    result.sizeFreed = this.formatBytes(result.bytesFreed);
    result.success = result.errors.length === 0;
    result.duration = Date.now() - startTime;

    return result;
  }

  /**
   * Clean registry cache
   */
  private cleanCache(dryRun = false): {
    cleaned: CleanedItem[];
    bytes: number;
    errors: CleanError[];
  } {
    const cleaned: CleanedItem[] = [];
    const errors: CleanError[] = [];
    let bytes = 0;

    const cacheDir = path.join(this.synapSyncDir, 'cache');

    if (!fs.existsSync(cacheDir)) {
      return { cleaned, bytes, errors };
    }

    try {
      const items = this.listDirectory(cacheDir);

      for (const item of items) {
        const size = this.getSize(item);
        cleaned.push({
          type: 'cache',
          path: item,
          size,
        });
        bytes += size;

        if (!dryRun) {
          try {
            this.removeItem(item);
          } catch (error) {
            errors.push({
              path: item,
              message: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }
    } catch (error) {
      errors.push({
        path: cacheDir,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return { cleaned, bytes, errors };
  }

  /**
   * Clean orphaned symlinks from provider directories
   */
  private cleanOrphans(dryRun = false): {
    cleaned: CleanedItem[];
    errors: CleanError[];
  } {
    const cleaned: CleanedItem[] = [];
    const errors: CleanError[] = [];

    if (this.config === null) {
      return { cleaned, errors };
    }

    const providers = this.config.sync?.providers ?? {};
    const enabledProviders = Object.entries(providers)
      .filter(([, cfg]) => (cfg as { enabled?: boolean }).enabled === true)
      .map(([name]) => name as SupportedProvider);

    const symlink = new SymlinkManager(this.projectRoot, this.synapSyncDir);

    for (const provider of enabledProviders) {
      try {
        const removed = symlink.cleanProvider(provider, dryRun);

        for (const name of removed) {
          cleaned.push({
            type: 'orphan',
            path: name,
            size: 0,
          });
        }
      } catch (error) {
        errors.push({
          path: provider,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { cleaned, errors };
  }

  /**
   * Clean temp files
   */
  private cleanTemp(dryRun = false): {
    cleaned: CleanedItem[];
    bytes: number;
    errors: CleanError[];
  } {
    const cleaned: CleanedItem[] = [];
    const errors: CleanError[] = [];
    let bytes = 0;

    const tempPatterns = [
      path.join(this.synapSyncDir, '.tmp'),
      path.join(this.synapSyncDir, 'temp'),
      path.join(this.synapSyncDir, '*.tmp'),
      path.join(this.synapSyncDir, '*.temp'),
    ];

    for (const pattern of tempPatterns) {
      // Check if it's a directory or file (not a glob pattern)
      if (!pattern.includes('*')) {
        if (fs.existsSync(pattern)) {
          const size = this.getSize(pattern);
          cleaned.push({
            type: 'temp',
            path: pattern,
            size,
          });
          bytes += size;

          if (!dryRun) {
            try {
              this.removeItem(pattern);
            } catch (error) {
              errors.push({
                path: pattern,
                message: error instanceof Error ? error.message : 'Unknown error',
              });
            }
          }
        }
      } else {
        // Handle glob patterns
        const dir = path.dirname(pattern);
        const ext = path.extname(pattern);

        if (fs.existsSync(dir)) {
          try {
            const entries = fs.readdirSync(dir);
            for (const entry of entries) {
              if (entry.endsWith(ext.slice(1))) {
                // Remove the *
                const fullPath = path.join(dir, entry);
                const size = this.getSize(fullPath);
                cleaned.push({
                  type: 'temp',
                  path: fullPath,
                  size,
                });
                bytes += size;

                if (!dryRun) {
                  try {
                    this.removeItem(fullPath);
                  } catch (error) {
                    errors.push({
                      path: fullPath,
                      message: error instanceof Error ? error.message : 'Unknown error',
                    });
                  }
                }
              }
            }
          } catch (error) {
            errors.push({
              path: pattern,
              message: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }
      }
    }

    return { cleaned, bytes, errors };
  }

  /**
   * List all files/directories in a directory recursively
   */
  private listDirectory(dir: string): string[] {
    const items: string[] = [];

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      items.push(fullPath);

      if (entry.isDirectory()) {
        items.push(...this.listDirectory(fullPath));
      }
    }

    return items;
  }

  /**
   * Get the size of a file or directory
   */
  private getSize(itemPath: string): number {
    try {
      const stats = fs.statSync(itemPath);

      if (stats.isFile()) {
        return stats.size;
      }

      if (stats.isDirectory()) {
        let size = 0;
        const entries = fs.readdirSync(itemPath, { withFileTypes: true });
        for (const entry of entries) {
          size += this.getSize(path.join(itemPath, entry.name));
        }
        return size;
      }

      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Remove a file or directory
   */
  private removeItem(itemPath: string): void {
    const stats = fs.lstatSync(itemPath);

    if (stats.isSymbolicLink() || stats.isFile()) {
      fs.unlinkSync(itemPath);
    } else if (stats.isDirectory()) {
      fs.rmSync(itemPath, { recursive: true });
    }
  }

  /**
   * Format bytes to human readable string
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);

    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
  }
}
