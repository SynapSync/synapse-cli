/**
 * Sync Engine
 *
 * Synchronizes the filesystem with the manifest.json and providers
 * Phase 1: filesystem ↔ manifest reconciliation
 * Phase 2: manifest ↔ provider symlinks
 */

import * as path from 'path';
import type {
  SyncResult,
  SyncOptions,
  SyncAction,
  SyncError,
  SyncProgressCallback,
} from './types.js';
import { CognitiveScanner } from '../scanner/scanner.js';
import { ManifestManager } from '../manifest/manager.js';
import { SymlinkManager } from '../symlink/manager.js';
import type { ScannedCognitive } from '../scanner/types.js';
import type { ProviderSyncResult } from '../symlink/types.js';
import type { SupportedProvider } from '../../core/constants.js';
import type { ProjectConfig } from '../config/schema.js';

export class SyncEngine {
  private scanner: CognitiveScanner;
  private manifest: ManifestManager;
  private symlink: SymlinkManager;
  private projectRoot: string;
  private config: ProjectConfig | null;

  constructor(synapSyncDir: string, projectRoot?: string, config?: ProjectConfig) {
    this.projectRoot = projectRoot ?? path.dirname(synapSyncDir);
    this.config = config ?? null;
    this.scanner = new CognitiveScanner(synapSyncDir);
    this.manifest = new ManifestManager(synapSyncDir);
    this.symlink = new SymlinkManager(this.projectRoot, synapSyncDir);
  }

  /**
   * Perform a full sync of filesystem to manifest and providers
   */
  sync(options: SyncOptions = {}, onProgress?: SyncProgressCallback): SyncResult {
    const startTime = Date.now();
    const actions: SyncAction[] = [];
    const errors: SyncError[] = [];
    let providerResults: ProviderSyncResult[] | undefined;

    try {
      // Phase 1: Scan filesystem
      onProgress?.({
        phase: 'scanning',
        message: 'Scanning filesystem for cognitives...',
      });

      const scanOpts: import('../scanner/types.js').ScanOptions = {};
      if (options.types !== undefined) scanOpts.types = options.types;
      if (options.categories !== undefined) scanOpts.categories = options.categories;
      const scanned = this.scanner.scan(scanOpts);

      onProgress?.({
        phase: 'scanning',
        message: `Found ${scanned.length} cognitives in filesystem`,
        total: scanned.length,
      });

      // Phase 2: Compare with manifest
      onProgress?.({
        phase: 'comparing',
        message: 'Comparing with manifest...',
      });

      const manifestCognitives = this.manifest.getCognitives();
      const comparison = this.scanner.compare(scanned, manifestCognitives);

      // Build list of actions
      for (const cognitive of comparison.new) {
        actions.push({
          operation: 'add',
          cognitive,
          reason: 'New cognitive found in filesystem',
        });
      }

      for (const cognitive of comparison.modified) {
        actions.push({
          operation: 'update',
          cognitive,
          reason: 'Cognitive content has changed',
        });
      }

      for (const name of comparison.removed) {
        actions.push({
          operation: 'remove',
          cognitive: name,
          reason: 'Cognitive no longer exists in filesystem',
        });
      }

      onProgress?.({
        phase: 'comparing',
        message: `Found ${actions.length} changes to sync`,
      });

      // Phase 3: Apply manifest changes (unless dry run)
      if (options.dryRun !== true && actions.length > 0) {
        onProgress?.({
          phase: 'reconciling',
          message: 'Applying changes to manifest...',
          total: actions.length,
          processed: 0,
        });

        let processed = 0;
        for (const action of actions) {
          try {
            this.applyAction(action);
            processed++;
            onProgress?.({
              phase: 'reconciling',
              message: `Applied ${action.operation} for ${this.getActionName(action)}`,
              total: actions.length,
              processed,
              current: this.getActionName(action),
            });
          } catch (error) {
            errors.push({
              cognitive: this.getActionName(action),
              message: error instanceof Error ? error.message : 'Unknown error',
              code: 'UNKNOWN',
            });
          }
        }

        // Save manifest
        onProgress?.({
          phase: 'saving',
          message: 'Saving manifest...',
        });

        this.manifest.save();
      }

      // Phase 4: Provider sync (unless manifestOnly)
      if (options.manifestOnly !== true) {
        providerResults = this.syncProviders(scanned, options, onProgress);

        // Add provider errors to main errors
        for (const result of providerResults) {
          for (const error of result.errors) {
            errors.push({
              cognitive: error.path,
              message: error.message,
              code: 'UNKNOWN',
            });
          }
        }

        // Update provider sync state in manifest
        if (options.dryRun !== true) {
          this.updateProviderSyncState(providerResults, scanned);
          this.manifest.save();
        }
      }

      onProgress?.({
        phase: 'complete',
        message: options.dryRun === true ? 'Dry run complete' : 'Sync complete',
      });

      const duration = Date.now() - startTime;

      const result: SyncResult = {
        success: errors.length === 0,
        added: comparison.new.length,
        removed: comparison.removed.length,
        updated: comparison.modified.length,
        unchanged: comparison.unchanged,
        total: this.manifest.getCognitiveCount(),
        errors,
        actions,
        duration,
      };
      if (providerResults !== undefined) {
        result.providerResults = providerResults;
      }
      return result;
    } catch (error) {
      errors.push({
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'SCAN_FAILED',
      });

      const result: SyncResult = {
        success: false,
        added: 0,
        removed: 0,
        updated: 0,
        unchanged: 0,
        total: this.manifest.getCognitiveCount(),
        errors,
        actions,
        duration: Date.now() - startTime,
      };
      if (providerResults !== undefined) {
        result.providerResults = providerResults;
      }
      return result;
    }
  }

  /**
   * Sync cognitives to providers
   */
  private syncProviders(
    cognitives: ScannedCognitive[],
    options: SyncOptions,
    onProgress?: SyncProgressCallback
  ): ProviderSyncResult[] {
    const results: ProviderSyncResult[] = [];
    const enabledProviders = this.getEnabledProviders(options.provider);

    if (enabledProviders.length === 0) {
      return results;
    }

    onProgress?.({
      phase: 'reconciling',
      message: `Syncing to ${enabledProviders.length} provider(s)...`,
    });

    for (const provider of enabledProviders) {
      onProgress?.({
        phase: 'reconciling',
        message: `Syncing to ${provider}...`,
        current: provider,
      });

      const symlinkOpts: import('../symlink/types.js').SymlinkOptions = {};
      if (options.copy !== undefined) symlinkOpts.copy = options.copy;
      if (options.dryRun !== undefined) symlinkOpts.dryRun = options.dryRun;
      if (options.force !== undefined) symlinkOpts.force = options.force;
      const result = this.symlink.syncProvider(provider, cognitives, symlinkOpts);

      results.push(result);
    }

    return results;
  }

  /**
   * Get enabled providers from config
   */
  private getEnabledProviders(filterProvider?: SupportedProvider): SupportedProvider[] {
    if (this.config === null) {
      // No config, return empty (no providers configured)
      return [];
    }

    const providers = this.config.sync?.providers ?? {};
    const enabled: SupportedProvider[] = [];

    for (const [name, config] of Object.entries(providers)) {
      const providerConfig = config;
      if (providerConfig.enabled === true) {
        // If filtering by provider, only include that one
        if (filterProvider !== undefined && filterProvider !== name) {
          continue;
        }
        enabled.push(name as SupportedProvider);
      }
    }

    return enabled;
  }

  /**
   * Update provider sync state in manifest
   */
  private updateProviderSyncState(
    results: ProviderSyncResult[],
    cognitives: ScannedCognitive[]
  ): void {
    for (const result of results) {
      this.manifest.setProviderSync(result.provider, {
        lastSync: new Date().toISOString(),
        method: result.method,
        cognitives: cognitives.map((c) => c.name),
      });
    }
  }

  /**
   * Get a preview of what sync would do without making changes
   */
  preview(options: SyncOptions = {}): SyncResult {
    return this.sync({ ...options, dryRun: true });
  }

  /**
   * Get current sync status (what's in manifest vs filesystem)
   */
  getStatus(): {
    manifest: number;
    filesystem: number;
    inSync: boolean;
    newInFilesystem: number;
    removedFromFilesystem: number;
    modified: number;
  } {
    const scanned = this.scanner.scan();
    const manifestCognitives = this.manifest.getCognitives();
    const comparison = this.scanner.compare(scanned, manifestCognitives);

    return {
      manifest: manifestCognitives.length,
      filesystem: scanned.length,
      inSync:
        comparison.new.length === 0 &&
        comparison.removed.length === 0 &&
        comparison.modified.length === 0,
      newInFilesystem: comparison.new.length,
      removedFromFilesystem: comparison.removed.length,
      modified: comparison.modified.length,
    };
  }

  /**
   * Get provider sync status
   */
  getProviderStatus(provider: SupportedProvider): {
    valid: number;
    broken: number;
    orphaned: number;
  } {
    const { valid, broken, orphaned } = this.symlink.verifyProvider(provider);
    return {
      valid: valid.length,
      broken: broken.length,
      orphaned: orphaned.length,
    };
  }

  /**
   * Apply a single sync action
   */
  private applyAction(action: SyncAction): void {
    switch (action.operation) {
      case 'add': {
        const scanned = action.cognitive as ScannedCognitive;
        const manifestCognitive = this.scanner.toManifestCognitive(scanned);
        this.manifest.addCognitive(manifestCognitive);
        break;
      }
      case 'update': {
        const scanned = action.cognitive as ScannedCognitive;
        const manifestCognitive = this.scanner.toManifestCognitive(scanned);
        this.manifest.updateCognitive(scanned.name, manifestCognitive);
        break;
      }
      case 'remove': {
        const name = action.cognitive as string;
        this.manifest.removeCognitive(name);
        break;
      }
    }
  }

  /**
   * Get the name of the cognitive in an action
   */
  private getActionName(action: SyncAction): string {
    if (typeof action.cognitive === 'string') {
      return action.cognitive;
    }
    return action.cognitive.name;
  }

  /**
   * Get the manifest manager (for external access)
   */
  getManifest(): ManifestManager {
    return this.manifest;
  }

  /**
   * Get the scanner (for external access)
   */
  getScanner(): CognitiveScanner {
    return this.scanner;
  }

  /**
   * Get the symlink manager (for external access)
   */
  getSymlinkManager(): SymlinkManager {
    return this.symlink;
  }
}
