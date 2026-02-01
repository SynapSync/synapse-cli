/**
 * Sync Command
 *
 * Synchronize the filesystem with the manifest.json and providers
 * Phase 1: Detects locally-created cognitives and updates manifest
 * Phase 2: Creates symlinks in provider directories
 */

import type { Command } from 'commander';
import pc from 'picocolors';
import { ConfigManager } from '../services/config/manager.js';
import { SyncEngine } from '../services/sync/engine.js';
import { regenerateAgentsMd } from '../services/agents-md/generator.js';
import type { SyncResult, SyncAction, SyncOptions } from '../services/sync/types.js';
import type { ProviderSyncResult } from '../services/symlink/types.js';
import { COGNITIVE_TYPES, CATEGORIES, SUPPORTED_PROVIDERS } from '../core/constants.js';
import type { CognitiveType, Category, SupportedProvider } from '../core/constants.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface SyncCommandOptions {
  dryRun?: boolean;
  type?: string;
  category?: string;
  provider?: string;
  copy?: boolean;
  force?: boolean;
  json?: boolean;
  verbose?: boolean;
}

// ============================================
// Main Function
// ============================================

/**
 * Execute the sync command
 */
export function executeSyncCommand(options: SyncCommandOptions): void {
  logger.line();

  // Check if project is initialized
  const configManager = ConfigManager.findConfig();
  if (configManager === null) {
    logger.error('No SynapSync project found.');
    logger.hint('Run synapsync init to initialize a project first.');
    return;
  }

  // Validate options
  const validatedOptions = validateOptions(options);
  if (validatedOptions === null) {
    return;
  }

  // Create sync engine with config
  const synapSyncDir = configManager.getSynapSyncDir();
  const projectRoot = configManager.getProjectRoot();
  const config = configManager.getConfig();
  const syncEngine = new SyncEngine(synapSyncDir, projectRoot, config);

  // Show header
  if (options.json !== true) {
    if (options.dryRun === true) {
      logger.bold('  Sync Preview (Dry Run)');
    } else {
      logger.bold('  Syncing Cognitives');
    }
    logger.line();
  }

  // Perform sync
  const syncOpts: SyncOptions = {};
  if (options.dryRun !== undefined) syncOpts.dryRun = options.dryRun;
  if (validatedOptions.types !== undefined) syncOpts.types = validatedOptions.types;
  if (validatedOptions.categories !== undefined) syncOpts.categories = validatedOptions.categories;
  if (validatedOptions.provider !== undefined) syncOpts.provider = validatedOptions.provider;
  if (options.copy !== undefined) syncOpts.copy = options.copy;
  if (options.force !== undefined) syncOpts.force = options.force;
  if (options.verbose !== undefined) syncOpts.verbose = options.verbose;
  const result = syncEngine.sync(
    syncOpts,
    options.json !== true
      ? (status) => {
          if (options.verbose === true) {
            logger.log(`  ${pc.dim(status.message)}`);
          }
        }
      : undefined
  );

  // Regenerate AGENTS.md after sync (unless dry run)
  if (options.dryRun !== true) {
    const synapSyncDir = configManager.getSynapSyncDir();
    const projectRoot = configManager.getProjectRoot();
    regenerateAgentsMd(projectRoot, synapSyncDir);
  }

  // Output results
  if (options.json === true) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  displayResults(result, options);
}

// ============================================
// Validation
// ============================================

interface ValidatedSyncOptions {
  types?: CognitiveType[];
  categories?: Category[];
  provider?: SupportedProvider;
}

function validateOptions(options: SyncCommandOptions): ValidatedSyncOptions | null {
  const validated: ValidatedSyncOptions = {};

  // Validate type
  if (options.type !== undefined) {
    if (!COGNITIVE_TYPES.includes(options.type as CognitiveType)) {
      logger.error(`Invalid type: ${options.type}`);
      logger.hint(`Valid types: ${COGNITIVE_TYPES.join(', ')}`);
      return null;
    }
    validated.types = [options.type as CognitiveType];
  }

  // Validate category
  if (options.category !== undefined) {
    if (!(CATEGORIES as readonly string[]).includes(options.category)) {
      logger.error(`Invalid category: ${options.category}`);
      logger.hint(`Valid categories: ${CATEGORIES.join(', ')}`);
      return null;
    }
    validated.categories = [options.category];
  }

  // Validate provider
  if (options.provider !== undefined) {
    if (!SUPPORTED_PROVIDERS.includes(options.provider as SupportedProvider)) {
      logger.error(`Invalid provider: ${options.provider}`);
      logger.hint(`Valid providers: ${SUPPORTED_PROVIDERS.join(', ')}`);
      return null;
    }
    validated.provider = options.provider as SupportedProvider;
  }

  return validated;
}

// ============================================
// Display Functions
// ============================================

function displayResults(result: SyncResult, options: SyncCommandOptions): void {
  const hasManifestChanges = result.added > 0 || result.removed > 0 || result.updated > 0;
  const hasProviderResults = result.providerResults !== undefined && result.providerResults.length > 0;

  // Check if there are any provider changes
  const hasProviderChanges = hasProviderResults && result.providerResults?.some(
    (pr) => pr.created.length > 0 || pr.removed.length > 0
  );

  if (!hasManifestChanges && hasProviderChanges !== true) {
    logger.log(`  ${pc.green('✓')} Everything is in sync`);
    logger.line();
    logger.log(`  ${pc.dim(`${result.total} cognitives in manifest`)}`);
    if (hasProviderResults && result.providerResults !== undefined) {
      const syncedProviders = result.providerResults.filter((pr) => pr.skipped.length > 0 || pr.created.length > 0);
      if (syncedProviders.length > 0) {
        logger.log(`  ${pc.dim(`${syncedProviders.length} provider(s) synced`)}`);
      }
    }
    logger.line();
    return;
  }

  // Display manifest actions
  if (result.actions.length > 0 && (options.verbose === true || options.dryRun === true)) {
    logger.bold('  Manifest Changes:');
    logger.line();
    displayActions(result.actions, options.dryRun === true);
    logger.line();
  }

  // Display manifest summary
  if (hasManifestChanges) {
    if (options.dryRun === true) {
      logger.bold('  Manifest changes to apply:');
    } else {
      logger.bold('  Manifest sync:');
    }
    logger.line();

    if (result.added > 0) {
      logger.log(`    ${pc.green('+')} ${result.added} added`);
    }
    if (result.updated > 0) {
      logger.log(`    ${pc.yellow('~')} ${result.updated} updated`);
    }
    if (result.removed > 0) {
      logger.log(`    ${pc.red('-')} ${result.removed} removed`);
    }
    if (result.unchanged > 0) {
      logger.log(`    ${pc.dim('○')} ${result.unchanged} unchanged`);
    }
    logger.line();
  }

  // Display provider results
  if (hasProviderResults) {
    logger.bold('  Provider sync:');
    logger.line();

    for (const providerResult of result.providerResults ?? []) {
      displayProviderResult(providerResult, options);
    }
  }

  // Summary
  logger.log(`  ${pc.dim(`Total: ${result.total} cognitives | Duration: ${result.duration}ms`)}`);
  logger.line();

  // Errors
  if (result.errors.length > 0) {
    logger.line();
    logger.bold(`  ${pc.red('Errors:')}`);
    logger.line();
    for (const error of result.errors) {
      logger.log(`    ${pc.red('✗')} ${error.cognitive ?? 'Unknown'}: ${error.message}`);
    }
    logger.line();
  }

  // Hints
  if (options.dryRun === true) {
    logger.hint('Run synapsync sync without --dry-run to apply changes.');
  } else {
    logger.hint('Run synapsync list to see all installed cognitives.');
  }
}

function displayActions(actions: SyncAction[], isDryRun: boolean): void {
  const verb = isDryRun ? 'Would' : 'Did';

  for (const action of actions) {
    const name = typeof action.cognitive === 'string' ? action.cognitive : action.cognitive.name;

    switch (action.operation) {
      case 'add':
        logger.log(`    ${pc.green('+')} ${verb} add: ${pc.white(name)}`);
        break;
      case 'update':
        logger.log(`    ${pc.yellow('~')} ${verb} update: ${pc.white(name)}`);
        break;
      case 'remove':
        logger.log(`    ${pc.red('-')} ${verb} remove: ${pc.white(name)}`);
        break;
    }
  }
}

function displayProviderResult(result: ProviderSyncResult, options: SyncCommandOptions): void {
  const created = result.created.filter((c) => c.success).length;
  const skipped = result.skipped.length;
  const removed = result.removed.length;
  const errors = result.errors.length;

  const methodLabel = result.method === 'symlink' ? 'symlinks' : 'copies';
  const hasChanges = created > 0 || removed > 0;

  logger.log(`    ${pc.cyan(result.provider)}:`);

  if (hasChanges || options.verbose === true) {
    if (created > 0) {
      logger.log(`      ${pc.green('✓')} ${created} ${methodLabel} created`);
    }
    if (skipped > 0) {
      logger.log(`      ${pc.dim('○')} ${skipped} already synced`);
    }
    if (removed > 0) {
      logger.log(`      ${pc.red('-')} ${removed} orphaned removed`);
    }
    if (errors > 0) {
      logger.log(`      ${pc.red('✗')} ${errors} errors`);
    }
  } else {
    logger.log(`      ${pc.green('✓')} ${skipped + created} ${methodLabel} synced`);
  }

  logger.line();
}

// ============================================
// Status Subcommand
// ============================================

/**
 * Execute the sync status subcommand
 */
export function executeSyncStatusCommand(options: { json?: boolean }): void {
  logger.line();

  // Check if project is initialized
  const configManager = ConfigManager.findConfig();
  if (configManager === null) {
    logger.error('No SynapSync project found.');
    logger.hint('Run synapsync init to initialize a project first.');
    return;
  }

  // Create sync engine with config
  const synapSyncDir = configManager.getSynapSyncDir();
  const projectRoot = configManager.getProjectRoot();
  const config = configManager.getConfig();
  const syncEngine = new SyncEngine(synapSyncDir, projectRoot, config);

  // Get status
  const status = syncEngine.getStatus();

  // Get provider status
  const providers = config.sync?.providers ?? {};
  const enabledProviders = Object.entries(providers)
    .filter(([, cfg]) => (cfg as { enabled?: boolean }).enabled === true)
    .map(([name]) => name as SupportedProvider);

  const providerStatuses: Record<string, { valid: number; broken: number; orphaned: number }> = {};
  for (const provider of enabledProviders) {
    providerStatuses[provider] = syncEngine.getProviderStatus(provider);
  }

  if (options.json === true) {
    console.log(JSON.stringify({ ...status, providers: providerStatuses }, null, 2));
    return;
  }

  // Display status
  logger.bold('  Sync Status');
  logger.line();

  if (status.inSync) {
    logger.log(`  ${pc.green('✓')} Filesystem and manifest are in sync`);
  } else {
    logger.log(`  ${pc.yellow('!')} Out of sync`);
  }

  logger.line();
  logger.log(`  ${pc.dim('Manifest:')} ${status.manifest} cognitives`);
  logger.log(`  ${pc.dim('Filesystem:')} ${status.filesystem} cognitives`);

  if (!status.inSync) {
    logger.line();

    if (status.newInFilesystem > 0) {
      logger.log(`  ${pc.green('+')} ${status.newInFilesystem} new in filesystem`);
    }
    if (status.removedFromFilesystem > 0) {
      logger.log(`  ${pc.red('-')} ${status.removedFromFilesystem} removed from filesystem`);
    }
    if (status.modified > 0) {
      logger.log(`  ${pc.yellow('~')} ${status.modified} modified`);
    }
  }

  // Provider status
  if (enabledProviders.length > 0) {
    logger.line();
    logger.bold('  Provider Status:');
    logger.line();

    for (const provider of enabledProviders) {
      const pStatus = providerStatuses[provider];
      if (pStatus === undefined) continue;

      const total = pStatus.valid + pStatus.broken + pStatus.orphaned;
      const hasIssues = pStatus.broken > 0 || pStatus.orphaned > 0;

      logger.log(`    ${pc.cyan(provider)}:`);
      if (hasIssues) {
        logger.log(`      ${pc.green('✓')} ${pStatus.valid} valid`);
        if (pStatus.broken > 0) {
          logger.log(`      ${pc.red('✗')} ${pStatus.broken} broken`);
        }
        if (pStatus.orphaned > 0) {
          logger.log(`      ${pc.yellow('?')} ${pStatus.orphaned} orphaned`);
        }
      } else if (total > 0) {
        logger.log(`      ${pc.green('✓')} ${total} symlinks valid`);
      } else {
        logger.log(`      ${pc.dim('○')} No symlinks yet`);
      }
    }
  }

  logger.line();

  if (!status.inSync || Object.values(providerStatuses).some((s) => s.broken > 0 || s.orphaned > 0)) {
    logger.hint('Run synapsync sync to synchronize.');
  }
}

// ============================================
// Command Registration
// ============================================

/**
 * Register sync command with Commander
 */
export function registerSyncCommand(program: Command): void {
  const syncCommand = program
    .command('sync')
    .description('Synchronize cognitives with manifest and providers')
    .option('-n, --dry-run', 'Preview changes without applying them')
    .option('-t, --type <type>', 'Sync only specific type (skill, agent, prompt, workflow, tool)')
    .option('-c, --category <category>', 'Sync only specific category')
    .option('-p, --provider <provider>', 'Sync only to specific provider (claude, cursor, etc.)')
    .option('--copy', 'Use file copy instead of symlinks')
    .option('-f, --force', 'Force sync even if already synced')
    .option('-v, --verbose', 'Show detailed output')
    .option('--json', 'Output as JSON')
    .action((options: SyncCommandOptions) => {
      executeSyncCommand(options);
    });

  // Status subcommand
  syncCommand
    .command('status')
    .description('Show sync status between filesystem, manifest, and providers')
    .option('--json', 'Output as JSON')
    .action((options: { json?: boolean }) => {
      executeSyncStatusCommand(options);
    });
}
