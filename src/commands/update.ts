/**
 * Update Command
 *
 * Update installed cognitives to their latest versions
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Command } from 'commander';
import pc from 'picocolors';
import { ConfigManager } from '../services/config/manager.js';
import { ManifestManager } from '../services/manifest/manager.js';
import { UpdateChecker } from '../services/maintenance/update-checker.js';
import { RegistryClient } from '../services/registry/client.js';
import { SyncEngine } from '../services/sync/engine.js';
import { regenerateAgentsMd } from '../services/agents-md/generator.js';
import type { UpdateCheckResult } from '../services/maintenance/types.js';
import { COGNITIVE_FILE_NAMES } from '../core/constants.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface UpdateCommandOptions {
  all?: boolean;
  force?: boolean;
  dryRun?: boolean;
  json?: boolean;
}

// ============================================
// Main Function
// ============================================

/**
 * Execute the update command
 */
export async function executeUpdateCommand(
  cognitiveName?: string,
  options: UpdateCommandOptions = {}
): Promise<void> {
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
  const manifest = new ManifestManager(synapSyncDir);
  const registry = new RegistryClient();
  const checker = new UpdateChecker(registry);

  // Header
  if (options.json !== true) {
    if (options.dryRun === true) {
      logger.bold('  Update Preview (Dry Run)');
    } else {
      logger.bold('  Checking for Updates');
    }
    logger.line();
  }

  // Get installed cognitives
  const installed = manifest.getCognitives();

  if (installed.length === 0) {
    if (options.json === true) {
      console.log(JSON.stringify({ message: 'No cognitives installed' }));
    } else {
      logger.log(`  ${pc.dim('No cognitives installed.')}`);
      logger.hint('Run synapsync add <name> to add a cognitive.');
    }
    return;
  }

  // Check for updates
  let checkResult: UpdateCheckResult;

  if (cognitiveName !== undefined && options.all !== true) {
    // Check specific cognitive
    const cognitive = installed.find((c) => c.name === cognitiveName);
    if (cognitive === undefined) {
      logger.error(`Cognitive '${cognitiveName}' is not installed.`);
      logger.hint('Run synapsync list to see installed cognitives.');
      return;
    }

    if (cognitive.source !== 'registry') {
      logger.error(`Cognitive '${cognitiveName}' was installed locally and cannot be updated from registry.`);
      return;
    }

    const updateInfo = await checker.checkOne(cognitive);
    checkResult = {
      checked: 1,
      updatesAvailable: updateInfo.hasUpdate ? [updateInfo] : [],
      upToDate: updateInfo.hasUpdate ? [] : [updateInfo],
      errors: [],
      checkTime: new Date().toISOString(),
    };
  } else {
    // Check all
    checkResult = await checker.checkAll(installed);
  }

  // JSON output
  if (options.json === true) {
    console.log(JSON.stringify(checkResult, null, 2));
    return;
  }

  // Display check results
  displayCheckResults(checkResult);

  // If no updates available, we're done
  if (checkResult.updatesAvailable.length === 0) {
    logger.line();
    logger.log(`  ${pc.green('✓')} All cognitives are up to date`);
    logger.line();
    return;
  }

  // If dry run, don't actually update
  if (options.dryRun === true) {
    logger.line();
    logger.hint('Run synapsync update without --dry-run to apply updates.');
    return;
  }

  // Perform updates
  logger.line();
  logger.bold('  Updating...');
  logger.line();

  const updated: string[] = [];
  const failed: Array<{ name: string; error: string }> = [];

  for (const update of checkResult.updatesAvailable) {
    try {
      logger.log(`  ${pc.cyan('↓')} Updating ${update.name}...`);

      // Download new version from registry
      const downloaded = await registry.download(update.name);

      // Get target directory from manifest
      const manifestEntry = installed.find((c) => c.name === update.name);
      if (manifestEntry === undefined) continue;

      const targetDir = path.join(
        synapSyncDir,
        `${update.type}s`,
        update.category,
        update.name
      );

      // Save the new version
      const fileName = COGNITIVE_FILE_NAMES[update.type];
      const filePath = path.join(targetDir, fileName);

      // Ensure directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // Write the updated content
      fs.writeFileSync(filePath, downloaded.content, 'utf-8');

      // Update manifest entry
      manifest.updateCognitive(update.name, {
        version: update.latestVersion,
      });

      updated.push(update.name);
      logger.log(`    ${pc.green('✓')} Updated to v${update.latestVersion}`);
    } catch (error) {
      failed.push({
        name: update.name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      logger.log(`    ${pc.red('✗')} Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Save manifest
  manifest.save();

  // Re-sync providers
  logger.line();
  logger.log(`  ${pc.dim('Syncing providers...')}`);
  const config = configManager.getConfig();
  const syncEngine = new SyncEngine(synapSyncDir, projectRoot, config);
  syncEngine.sync();

  // Regenerate AGENTS.md
  regenerateAgentsMd(projectRoot, synapSyncDir);

  // Summary
  logger.line();
  if (updated.length > 0) {
    logger.log(`  ${pc.green('✓')} Updated ${updated.length} cognitive(s)`);
  }
  if (failed.length > 0) {
    logger.log(`  ${pc.red('✗')} Failed to update ${failed.length} cognitive(s)`);
  }
  logger.line();
}

// ============================================
// Check for Outdated (list --outdated)
// ============================================

/**
 * Check and display outdated cognitives
 */
export async function executeCheckOutdatedCommand(options: { json?: boolean }): Promise<void> {
  logger.line();

  // Check if project is initialized
  const configManager = ConfigManager.findConfig();
  if (configManager === null) {
    logger.error('No SynapSync project found.');
    logger.hint('Run synapsync init to initialize a project first.');
    return;
  }

  const synapSyncDir = configManager.getSynapSyncDir();
  const manifest = new ManifestManager(synapSyncDir);
  const checker = new UpdateChecker();

  // Header
  if (options.json !== true) {
    logger.bold('  Checking for Updates');
    logger.line();
  }

  // Get installed cognitives
  const installed = manifest.getCognitives();

  if (installed.length === 0) {
    if (options.json === true) {
      console.log(JSON.stringify({ message: 'No cognitives installed' }));
    } else {
      logger.log(`  ${pc.dim('No cognitives installed.')}`);
    }
    return;
  }

  // Check for updates
  const checkResult = await checker.checkAll(installed);

  // JSON output
  if (options.json === true) {
    console.log(JSON.stringify(checkResult, null, 2));
    return;
  }

  // Display results
  displayCheckResults(checkResult);

  logger.line();
  if (checkResult.updatesAvailable.length > 0) {
    logger.hint('Run synapsync update --all to update all cognitives.');
  } else {
    logger.log(`  ${pc.green('✓')} All cognitives are up to date`);
  }
  logger.line();
}

// ============================================
// Display Functions
// ============================================

function displayCheckResults(result: UpdateCheckResult): void {
  if (result.updatesAvailable.length > 0) {
    logger.bold('  Updates available:');
    logger.line();

    for (const update of result.updatesAvailable) {
      logger.log(
        `    ${pc.yellow('↑')} ${pc.white(update.name)} ` +
          `${pc.dim(update.currentVersion)} → ${pc.green(update.latestVersion)}`
      );
    }
  }

  if (result.upToDate.length > 0 && result.updatesAvailable.length > 0) {
    logger.line();
    logger.log(`  ${pc.dim(`${result.upToDate.length} cognitive(s) up to date`)}`);
  }

  if (result.errors.length > 0) {
    logger.line();
    logger.log(`  ${pc.red('Errors:')}`);
    for (const error of result.errors) {
      logger.log(`    ${pc.red('✗')} ${error.cognitive}: ${error.message}`);
    }
  }
}

// ============================================
// Command Registration
// ============================================

/**
 * Register update command with Commander
 */
export function registerUpdateCommand(program: Command): void {
  program
    .command('update [cognitive]')
    .description('Update installed cognitives to latest versions')
    .option('-a, --all', 'Update all cognitives')
    .option('-f, --force', 'Force update even if already latest')
    .option('-n, --dry-run', 'Preview updates without applying them')
    .option('--json', 'Output as JSON')
    .action(async (cognitive: string | undefined, options: UpdateCommandOptions) => {
      await executeUpdateCommand(cognitive, options);
    });
}
