/**
 * Symlink Manager
 *
 * Manages symlinks and copies between .synapsync and provider directories
 */

import * as fs from 'fs';
import * as path from 'path';
import type {
  SymlinkCreateResult,
  ProviderSyncResult,
  SymlinkInfo,
  SymlinkOptions,
  CognitiveSymlinkMapping,
} from './types.js';
import type { SupportedProvider, CognitiveType } from '../../core/constants.js';
import { PROVIDER_PATHS, COGNITIVE_TYPES, COGNITIVE_SYNC_MODE } from '../../core/constants.js';
import type { ScannedCognitive } from '../scanner/types.js';

export class SymlinkManager {
  private projectRoot: string;
  private synapSyncDir: string;
  private supportsSymlinks: boolean | null = null;

  constructor(projectRoot: string, synapSyncDir: string) {
    this.projectRoot = projectRoot;
    this.synapSyncDir = synapSyncDir;
  }

  /**
   * Check if the system supports symlinks
   */
  checkSymlinkSupport(): boolean {
    if (this.supportsSymlinks !== null) {
      return this.supportsSymlinks;
    }

    // On Windows, symlinks require admin privileges or developer mode
    if (process.platform === 'win32') {
      try {
        const testSource = path.join(this.synapSyncDir, '.symlink-test');
        const testTarget = path.join(this.synapSyncDir, '.symlink-test-target');

        // Create a test file
        fs.writeFileSync(testTarget, 'test', 'utf-8');

        // Try to create a symlink
        fs.symlinkSync(testTarget, testSource);

        // Clean up
        fs.unlinkSync(testSource);
        fs.unlinkSync(testTarget);

        this.supportsSymlinks = true;
      } catch {
        this.supportsSymlinks = false;
      }
    } else {
      // Unix-like systems generally support symlinks
      this.supportsSymlinks = true;
    }

    return this.supportsSymlinks;
  }

  /**
   * Sync cognitives to a provider
   */
  syncProvider(
    provider: SupportedProvider,
    cognitives: ScannedCognitive[],
    options: SymlinkOptions = {}
  ): ProviderSyncResult {
    const result: ProviderSyncResult = {
      provider,
      created: [],
      skipped: [],
      removed: [],
      errors: [],
      method: this.getMethod(options),
    };

    const providerPaths = PROVIDER_PATHS[provider];
    if (providerPaths === undefined) {
      result.errors.push({
        path: provider,
        operation: 'create',
        message: `Unknown provider: ${provider}`,
      });
      return result;
    }

    // Get mappings for all cognitives
    const mappings = this.getMappings(provider, cognitives);

    // Get existing symlinks/copies in provider directories
    const existingLinks = this.getExistingLinks(provider);

    // Create set of expected links
    const expectedNames = new Set(mappings.map((m) => `${m.cognitiveType}/${m.cognitiveName}`));

    // Find orphaned links (exist but cognitive no longer present)
    for (const link of existingLinks) {
      const key = `${link.cognitiveType}/${link.cognitiveName}`;
      if (!expectedNames.has(key)) {
        if (options.dryRun !== true) {
          try {
            this.removeLink(link.path);
            result.removed.push(link.cognitiveName);
          } catch (error) {
            result.errors.push({
              path: link.path,
              operation: 'remove',
              message: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        } else {
          result.removed.push(link.cognitiveName);
        }
      }
    }

    // Create map of existing links for quick lookup
    const existingMap = new Map<string, SymlinkInfo>();
    for (const link of existingLinks) {
      existingMap.set(`${link.cognitiveType}/${link.cognitiveName}`, link);
    }

    // Process each mapping
    for (const mapping of mappings) {
      const key = `${mapping.cognitiveType}/${mapping.cognitiveName}`;
      const existing = existingMap.get(key);

      if (existing !== undefined && existing.isValid && options.force !== true) {
        // Already exists and valid
        result.skipped.push(mapping.cognitiveName);
        continue;
      }

      // Create the link
      if (options.dryRun !== true) {
        const createResult = this.createLink(mapping, options);
        result.created.push(createResult);

        if (!createResult.success && createResult.error !== undefined) {
          result.errors.push({
            path: mapping.targetPath,
            operation: 'create',
            message: createResult.error,
          });
        }
      } else {
        // Dry run - just report what would happen
        result.created.push({
          success: true,
          source: mapping.sourcePath,
          target: mapping.targetPath,
          method: result.method,
        });
      }
    }

    return result;
  }

  /**
   * Get mappings for cognitives to provider paths
   * Skills sync as folders (contain SKILL.md + assets/)
   * Other cognitives sync as flat files
   */
  private getMappings(
    provider: SupportedProvider,
    cognitives: ScannedCognitive[]
  ): CognitiveSymlinkMapping[] {
    const providerPaths = PROVIDER_PATHS[provider];
    const mappings: CognitiveSymlinkMapping[] = [];

    for (const cognitive of cognitives) {
      const typeDir = providerPaths[cognitive.type];
      if (typeDir === undefined) continue;

      const syncMode = COGNITIVE_SYNC_MODE[cognitive.type];

      if (syncMode === 'folder') {
        // Folder sync: symlink the entire cognitive directory
        // e.g., .claude/skills/skill-name/ -> .synapsync/skills/general/skill-name/
        mappings.push({
          cognitiveName: cognitive.name,
          cognitiveType: cognitive.type,
          sourcePath: cognitive.path, // Directory path
          targetPath: path.join(this.projectRoot, typeDir, cognitive.name),
          isFile: false,
        });
      } else {
        // File sync: symlink the cognitive file directly
        // e.g., .claude/agents/agent-name.md -> .synapsync/agents/general/agent-name/agent-name.md
        const fileName = cognitive.fileName ?? `${cognitive.name}.md`;
        mappings.push({
          cognitiveName: cognitive.name,
          cognitiveType: cognitive.type,
          sourcePath: cognitive.filePath, // File path
          targetPath: path.join(this.projectRoot, typeDir, fileName),
          isFile: true,
        });
      }
    }

    return mappings;
  }

  /**
   * Get existing links in provider directories
   * Scans for both files and directories (for backward compatibility)
   */
  getExistingLinks(provider: SupportedProvider): SymlinkInfo[] {
    const providerPaths = PROVIDER_PATHS[provider];
    const links: SymlinkInfo[] = [];

    for (const cognitiveType of COGNITIVE_TYPES) {
      const typeDir = providerPaths[cognitiveType];
      if (typeDir === undefined) continue;

      const fullPath = path.join(this.projectRoot, typeDir);
      if (!fs.existsSync(fullPath)) continue;

      const entries = fs.readdirSync(fullPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;

        const entryPath = path.join(fullPath, entry.name);

        // Include files (new flat structure) and directories/symlinks (legacy)
        if (entry.isFile() || entry.isDirectory() || entry.isSymbolicLink()) {
          const info = this.getLinkInfo(entryPath, cognitiveType);
          if (info !== null) {
            links.push(info);
          }
        }
      }
    }

    return links;
  }

  /**
   * Get information about a link
   */
  private getLinkInfo(linkPath: string, cognitiveType: CognitiveType): SymlinkInfo | null {
    try {
      const stats = fs.lstatSync(linkPath);
      const isSymlink = stats.isSymbolicLink();
      const baseName = path.basename(linkPath);

      // For symlinks, check what type it points to
      let isDirectory = stats.isDirectory();
      if (isSymlink) {
        try {
          const realStats = fs.statSync(linkPath);
          isDirectory = realStats.isDirectory();
        } catch {
          // Target doesn't exist, assume based on extension
          isDirectory = !baseName.match(/\.(md|yaml)$/i);
        }
      }

      // Only strip extension for files, not directories
      // Folders: "skill-name" stays "skill-name"
      // Files: "agent-name.md" becomes "agent-name"
      const cognitiveName = isDirectory ? baseName : baseName.replace(/\.(md|yaml)$/i, '');

      let target = '';
      let isValid = false;

      if (isSymlink) {
        target = fs.readlinkSync(linkPath);
        // Resolve relative to the link's directory
        const resolvedTarget = path.resolve(path.dirname(linkPath), target);
        isValid = fs.existsSync(resolvedTarget);
      } else if (stats.isDirectory()) {
        // It's a directory copy (legacy)
        target = linkPath;
        isValid = true;
      } else if (stats.isFile()) {
        // It's a file copy
        target = linkPath;
        isValid = true;
      }

      return {
        path: linkPath,
        target,
        exists: true,
        isSymlink,
        isValid,
        cognitiveName,
        cognitiveType,
      };
    } catch {
      return null;
    }
  }

  /**
   * Create a symlink or copy
   */
  private createLink(
    mapping: CognitiveSymlinkMapping,
    options: SymlinkOptions
  ): SymlinkCreateResult {
    const method = this.getMethod(options);
    const isFile = mapping.isFile ?? false;

    try {
      // Ensure parent directory exists
      const targetDir = path.dirname(mapping.targetPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Remove existing if force
      if (fs.existsSync(mapping.targetPath)) {
        if (options.force === true) {
          this.removeLink(mapping.targetPath);
        } else {
          return {
            success: false,
            source: mapping.sourcePath,
            target: mapping.targetPath,
            method,
            error: 'Target already exists',
          };
        }
      }

      if (method === 'symlink') {
        // Calculate relative path for symlink
        const relativePath = path.relative(targetDir, mapping.sourcePath);
        // Use 'file' type for file symlinks, 'dir' for directory symlinks
        fs.symlinkSync(relativePath, mapping.targetPath, isFile ? 'file' : 'dir');
      } else {
        // Copy file or directory
        if (isFile) {
          fs.copyFileSync(mapping.sourcePath, mapping.targetPath);
        } else {
          this.copyDirectory(mapping.sourcePath, mapping.targetPath);
        }
      }

      return {
        success: true,
        source: mapping.sourcePath,
        target: mapping.targetPath,
        method,
      };
    } catch (error) {
      // If symlink fails, try copy as fallback
      if (method === 'symlink' && options.copy !== true) {
        try {
          if (isFile) {
            fs.copyFileSync(mapping.sourcePath, mapping.targetPath);
          } else {
            this.copyDirectory(mapping.sourcePath, mapping.targetPath);
          }
          return {
            success: true,
            source: mapping.sourcePath,
            target: mapping.targetPath,
            method: 'copy',
          };
        } catch (copyError) {
          return {
            success: false,
            source: mapping.sourcePath,
            target: mapping.targetPath,
            method: 'copy',
            error: copyError instanceof Error ? copyError.message : 'Copy failed',
          };
        }
      }

      return {
        success: false,
        source: mapping.sourcePath,
        target: mapping.targetPath,
        method,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Remove a symlink, file, or directory
   */
  private removeLink(linkPath: string): void {
    const stats = fs.lstatSync(linkPath);

    if (stats.isSymbolicLink() || stats.isFile()) {
      fs.unlinkSync(linkPath);
    } else if (stats.isDirectory()) {
      fs.rmSync(linkPath, { recursive: true });
    }
  }

  /**
   * Copy a directory recursively
   */
  private copyDirectory(source: string, target: string): void {
    fs.mkdirSync(target, { recursive: true });

    const entries = fs.readdirSync(source, { withFileTypes: true });

    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  /**
   * Get the sync method to use
   */
  private getMethod(options: SymlinkOptions): 'symlink' | 'copy' {
    if (options.copy === true) {
      return 'copy';
    }

    if (!this.checkSymlinkSupport()) {
      return 'copy';
    }

    return 'symlink';
  }

  /**
   * Verify all symlinks for a provider are valid
   */
  verifyProvider(provider: SupportedProvider): {
    valid: SymlinkInfo[];
    broken: SymlinkInfo[];
    orphaned: SymlinkInfo[];
  } {
    const existingLinks = this.getExistingLinks(provider);
    const valid: SymlinkInfo[] = [];
    const broken: SymlinkInfo[] = [];
    const orphaned: SymlinkInfo[] = [];

    for (const link of existingLinks) {
      if (!link.isValid) {
        broken.push(link);
      } else {
        // Check if the target is within .synapsync
        if (link.isSymlink) {
          const resolvedTarget = path.resolve(path.dirname(link.path), link.target);
          if (!resolvedTarget.includes(path.basename(this.synapSyncDir))) {
            orphaned.push(link);
          } else {
            valid.push(link);
          }
        } else {
          valid.push(link);
        }
      }
    }

    return { valid, broken, orphaned };
  }

  /**
   * Clean up orphaned and broken symlinks
   */
  cleanProvider(provider: SupportedProvider, dryRun = false): string[] {
    const { broken, orphaned } = this.verifyProvider(provider);
    const removed: string[] = [];

    for (const link of [...broken, ...orphaned]) {
      if (!dryRun) {
        try {
          this.removeLink(link.path);
          removed.push(link.cognitiveName);
        } catch {
          // Ignore errors during cleanup
        }
      } else {
        removed.push(link.cognitiveName);
      }
    }

    return removed;
  }
}
