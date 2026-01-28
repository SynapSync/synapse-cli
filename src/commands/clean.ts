/**
 * Clean Command
 *
 * Clean cache, orphaned symlinks, and temp files
 */

import type { Command } from 'commander';
import pc from 'picocolors';
import { ConfigManager } from '../services/config/manager.js';
import { CleanerService } from '../services/maintenance/cleaner.js';
import type { CleanResult, CleanedItem } from '../services/maintenance/types.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface CleanCommandOptions {
  cache?: boolean;
  orphans?: boolean;
  temp?: boolean;
  all?: boolean;
  dryRun?: boolean;
  json?: boolean;
}

// ============================================
// Main Function
// ============================================

/**
 * Execute the clean command
 */
export async function executeCleanCommand(options: CleanCommandOptions = {}): Promise<void> {
  logger.line();

  // Check if project is initialized
  const configManager = ConfigManager.findConfig();
  if (configManager === null) {
    logger.error('No SynapSync project found.');
    logger.hint('Run synapsync init to initialize a project first.');
    return;
  }

  const synapSyncDir = configManager.getSynapSyncDir();
  const projectRoot = configManager.getProjectRoot();

  let config;
  try {
    config = configManager.getConfig();
  } catch {
    config = undefined;
  }

  const cleaner = new CleanerService(projectRoot, synapSyncDir, config);

  // Header
  if (options.json !== true) {
    if (options.dryRun === true) {
      logger.bold('  Clean Preview (Dry Run)');
    } else {
      logger.bold('  Cleaning');
    }
    logger.line();
  }

  // Run clean
  const result = cleaner.clean({
    cache: options.cache,
    orphans: options.orphans,
    temp: options.temp,
    all: options.all,
    dryRun: options.dryRun,
  });

  // JSON output
  if (options.json === true) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Display results
  displayResults(result, options);

  // Summary
  logger.line();
  if (result.cleaned.length === 0) {
    logger.log(`  ${pc.green('✓')} Nothing to clean`);
  } else if (options.dryRun === true) {
    logger.log(`  ${pc.dim(`Would clean ${result.cleaned.length} item(s), freeing ${result.sizeFreed}`)}`);
    logger.hint('Run synapsync clean without --dry-run to apply changes.');
  } else {
    logger.log(`  ${pc.green('✓')} Cleaned ${result.cleaned.length} item(s), freed ${result.sizeFreed}`);
  }

  if (result.errors.length > 0) {
    logger.log(`  ${pc.red('!')} ${result.errors.length} error(s) occurred`);
  }

  logger.line();
}

// ============================================
// Display Functions
// ============================================

function displayResults(result: CleanResult, options: CleanCommandOptions): void {
  const verb = options.dryRun === true ? 'Would clean' : 'Cleaned';

  // Group by type
  const byType = groupByType(result.cleaned);

  if (byType.cache.length > 0) {
    logger.log(`  ${pc.cyan('Cache:')}`);
    for (const item of byType.cache) {
      const size = formatBytes(item.size);
      logger.log(`    ${pc.dim('-')} ${getRelativePath(item.path)} ${pc.dim(`(${size})`)}`);
    }
    logger.line();
  }

  if (byType.orphan.length > 0) {
    logger.log(`  ${pc.cyan('Orphaned symlinks:')}`);
    for (const item of byType.orphan) {
      logger.log(`    ${pc.dim('-')} ${item.path}`);
    }
    logger.line();
  }

  if (byType.temp.length > 0) {
    logger.log(`  ${pc.cyan('Temp files:')}`);
    for (const item of byType.temp) {
      const size = formatBytes(item.size);
      logger.log(`    ${pc.dim('-')} ${getRelativePath(item.path)} ${pc.dim(`(${size})`)}`);
    }
    logger.line();
  }

  // Errors
  if (result.errors.length > 0) {
    logger.log(`  ${pc.red('Errors:')}`);
    for (const error of result.errors) {
      logger.log(`    ${pc.red('✗')} ${error.path}: ${error.message}`);
    }
    logger.line();
  }
}

function groupByType(items: CleanedItem[]): Record<CleanedItem['type'], CleanedItem[]> {
  const result: Record<CleanedItem['type'], CleanedItem[]> = {
    cache: [],
    orphan: [],
    temp: [],
  };

  for (const item of items) {
    result[item.type].push(item);
  }

  return result;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);

  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getRelativePath(fullPath: string): string {
  const cwd = process.cwd();
  if (fullPath.startsWith(cwd)) {
    return fullPath.slice(cwd.length + 1);
  }
  return fullPath;
}

// ============================================
// Command Registration
// ============================================

/**
 * Register clean command with Commander
 */
export function registerCleanCommand(program: Command): void {
  program
    .command('clean')
    .description('Clean cache, orphaned symlinks, and temp files')
    .option('-c, --cache', 'Clean registry cache')
    .option('-o, --orphans', 'Clean orphaned symlinks')
    .option('-t, --temp', 'Clean temp files')
    .option('-a, --all', 'Clean everything')
    .option('-n, --dry-run', 'Preview what would be cleaned')
    .option('--json', 'Output as JSON')
    .action(async (options: CleanCommandOptions) => {
      await executeCleanCommand(options);
    });
}
