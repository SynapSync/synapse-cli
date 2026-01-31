/**
 * Uninstall Command
 *
 * Remove installed cognitives from the project
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Command } from 'commander';
import pc from 'picocolors';
import { ConfigManager } from '../services/config/manager.js';
import { regenerateAgentsMd } from '../services/agents-md/generator.js';
import type { InstalledCognitive } from '../types/index.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface UninstallCommandOptions {
  force?: boolean;
  keepFiles?: boolean;
}

interface ProjectManifest {
  version: string;
  lastUpdated: string;
  cognitives: Record<string, InstalledCognitive>;
  syncs: Record<string, unknown>;
}

// ============================================
// Main Function
// ============================================

/**
 * Execute the uninstall command
 */
export function executeUninstallCommand(
  name: string,
  options: UninstallCommandOptions
): void {
  logger.line();

  // Check if project is initialized
  const configManager = ConfigManager.findConfig();
  if (configManager === null) {
    logger.error('No SynapSync project found.');
    logger.hint('Run synapsync init to initialize a project first.');
    return;
  }

  // Read manifest
  const manifest = readManifest(configManager);
  const cognitive = manifest.cognitives[name];

  if (cognitive === undefined) {
    logger.error(`Cognitive '${name}' is not installed.`);
    logger.hint('Run synapsync list to see installed cognitives.');
    return;
  }

  // Confirm uninstall (unless --force)
  if (options.force !== true) {
    logger.log(`  ${pc.yellow('!')} About to uninstall ${pc.bold(name)}`);
    logger.log(`    ${pc.dim('Type:')} ${cognitive.type}`);
    logger.log(`    ${pc.dim('Category:')} ${cognitive.category}`);
    logger.log(`    ${pc.dim('Version:')} ${cognitive.version}`);
    logger.line();
    logger.hint('Use --force to skip confirmation and uninstall directly.');
    logger.log(`  ${pc.dim('To confirm, run:')} synapsync uninstall ${name} --force`);
    return;
  }

  try {
    // Remove files (unless --keep-files)
    if (options.keepFiles !== true) {
      const cognitiveDir = getCognitiveDir(configManager, cognitive);
      if (fs.existsSync(cognitiveDir)) {
        fs.rmSync(cognitiveDir, { recursive: true, force: true });
        logger.log(`  ${pc.dim('Removed files from')} ${path.relative(process.cwd(), cognitiveDir)}`);
      }
    }

    // Update manifest
    delete manifest.cognitives[name];
    manifest.lastUpdated = new Date().toISOString();
    saveManifest(configManager, manifest);

    // Regenerate AGENTS.md
    regenerateAgentsMd(configManager.getProjectRoot(), configManager.getSynapSyncDir());

    // Success
    logger.line();
    logger.log(`  ${pc.green('✓')} Uninstalled ${pc.bold(name)}`);
    logger.line();

    // Check for provider symlinks that might need cleanup
    logger.hint('Note: Provider symlinks may need manual cleanup if sync was run.');
  } catch (error) {
    logger.line();
    if (error instanceof Error) {
      logger.error(`Uninstall failed: ${error.message}`);
    } else {
      logger.error('Uninstall failed with unknown error');
    }
  }
}

// ============================================
// Manifest Operations
// ============================================

function readManifest(configManager: ConfigManager): ProjectManifest {
  const synapSyncDir = configManager.getSynapSyncDir();
  const manifestPath = path.join(synapSyncDir, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      cognitives: {},
      syncs: {},
    };
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(content) as ProjectManifest;
  } catch {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      cognitives: {},
      syncs: {},
    };
  }
}

function saveManifest(configManager: ConfigManager, manifest: ProjectManifest): void {
  const synapSyncDir = configManager.getSynapSyncDir();
  const manifestPath = path.join(synapSyncDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

function getCognitiveDir(configManager: ConfigManager, cognitive: InstalledCognitive): string {
  const synapSyncDir = configManager.getSynapSyncDir();
  return path.join(synapSyncDir, `${cognitive.type}s`, cognitive.category, cognitive.name);
}

// ============================================
// Command Registration
// ============================================

/**
 * Register uninstall command with Commander
 */
export function registerUninstallCommand(program: Command): void {
  program
    .command('uninstall <name>')
    .alias('rm')
    .description('Uninstall a cognitive')
    .option('-f, --force', 'Skip confirmation')
    .option('--keep-files', 'Remove from manifest but keep files')
    .action((name: string, options: UninstallCommandOptions) => {
      executeUninstallCommand(name, options);
    });
}
