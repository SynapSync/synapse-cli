/**
 * Status Command
 *
 * Show the current status of the SynapSync project
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Command } from 'commander';
import pc from 'picocolors';
import { ConfigManager } from '../services/config/manager.js';
import {
  COGNITIVE_TYPES,
  SUPPORTED_PROVIDERS,
} from '../core/constants.js';
import type { CognitiveType, SupportedProvider } from '../core/constants.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface ProjectStatus {
  initialized: boolean;
  projectName?: string;
  projectRoot?: string;
  configPath?: string;
  storagePath?: string;
  cognitives: Record<CognitiveType, number>;
  providers: ProviderStatus[];
  lastSync?: string;
}

interface ProviderStatus {
  name: SupportedProvider;
  enabled: boolean;
  connected: boolean;
  cognitivesCount: number;
}

// ============================================
// Main Function
// ============================================

/**
 * Execute the status command
 */
export function executeStatusCommand(_args: string = ''): void {
  const status = getProjectStatus();

  logger.line();

  if (!status.initialized) {
    showNotInitialized();
    return;
  }

  showProjectStatus(status);
}

// ============================================
// Status Collection
// ============================================

function getProjectStatus(): ProjectStatus {
  const configManager = ConfigManager.findConfig();

  if (configManager === null) {
    return {
      initialized: false,
      cognitives: createEmptyCognitiveCount(),
      providers: [],
    };
  }

  const config = configManager.getConfig();
  const projectRoot = configManager.getProjectRoot();
  const storagePath = configManager.getSynapSyncDir();

  // Count cognitives by type
  const cognitives = countCognitives(storagePath);

  // Get provider status
  const providers = getProviderStatuses(config, projectRoot);

  // Get last sync from manifest
  const lastSync = getLastSyncTime(storagePath);

  return {
    initialized: true,
    projectName: config.name,
    projectRoot,
    configPath: path.join(projectRoot, 'synapsync.config.yaml'),
    storagePath,
    cognitives,
    providers,
    lastSync,
  };
}

function createEmptyCognitiveCount(): Record<CognitiveType, number> {
  const counts: Record<CognitiveType, number> = {} as Record<CognitiveType, number>;
  for (const type of COGNITIVE_TYPES) {
    counts[type] = 0;
  }
  return counts;
}

function countCognitives(storagePath: string): Record<CognitiveType, number> {
  const counts = createEmptyCognitiveCount();

  for (const type of COGNITIVE_TYPES) {
    const typePath = path.join(storagePath, `${type}s`);

    if (fs.existsSync(typePath)) {
      try {
        const entries = fs.readdirSync(typePath, { withFileTypes: true });
        // Count directories (each cognitive is a directory)
        counts[type] = entries.filter(
          (e) => e.isDirectory() || (e.isSymbolicLink() && !e.name.startsWith('.'))
        ).length;
      } catch {
        counts[type] = 0;
      }
    }
  }

  return counts;
}

function getProviderStatuses(
  config: ReturnType<ConfigManager['getConfig']>,
  projectRoot: string
): ProviderStatus[] {
  const statuses: ProviderStatus[] = [];

  for (const provider of SUPPORTED_PROVIDERS) {
    const providerConfig = config.sync?.providers?.[provider];
    const enabled = providerConfig?.enabled ?? false;

    // Check if provider directory exists and has cognitives
    const providerPath = path.join(projectRoot, `.${provider}`);
    let cognitivesCount = 0;

    if (fs.existsSync(providerPath)) {
      try {
        // Count all items in provider subdirectories
        const subdirs = ['skills', 'agents', 'prompts', 'workflows', 'tools'];
        for (const subdir of subdirs) {
          const subdirPath = path.join(providerPath, subdir);
          if (fs.existsSync(subdirPath)) {
            const entries = fs.readdirSync(subdirPath);
            cognitivesCount += entries.filter((e) => !e.startsWith('.')).length;
          }
        }
      } catch {
        // Ignore errors
      }
    }

    statuses.push({
      name: provider,
      enabled,
      connected: false, // TODO: Check actual connection status
      cognitivesCount,
    });
  }

  return statuses;
}

function getLastSyncTime(storagePath: string): string | undefined {
  const manifestPath = path.join(storagePath, 'manifest.json');

  if (!fs.existsSync(manifestPath)) {
    return undefined;
  }

  try {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    const manifest = JSON.parse(content) as { lastUpdated?: string };
    return manifest.lastUpdated;
  } catch {
    return undefined;
  }
}

// ============================================
// Display Functions
// ============================================

function showNotInitialized(): void {
  logger.bold('  Project Status');
  logger.line();
  logger.log(`  ${pc.red('●')} ${pc.dim('Not initialized')}`);
  logger.line();
  logger.hint('Run /init to initialize a SynapSync project.');
}

function showProjectStatus(status: ProjectStatus): void {
  // Header
  logger.bold(`  ${status.projectName ?? 'SynapSync Project'}`);
  logger.line();

  // Project info
  logger.log(`  ${pc.green('●')} ${pc.dim('Initialized')}`);
  logger.log(`  ${pc.dim('Root:')} ${status.projectRoot}`);
  logger.line();

  // Cognitives summary
  logger.bold('  Cognitives');
  const totalCognitives = Object.values(status.cognitives).reduce((a, b) => a + b, 0);

  if (totalCognitives === 0) {
    logger.log(`  ${pc.dim('No cognitives installed')}`);
  } else {
    for (const type of COGNITIVE_TYPES) {
      const count = status.cognitives[type];
      if (count > 0) {
        const icon = getCognitiveIcon(type);
        logger.log(`  ${icon} ${pc.white(count.toString().padStart(3))} ${type}s`);
      }
    }
    logger.log(`  ${pc.dim('───')}`);
    logger.log(`  ${pc.bold(totalCognitives.toString().padStart(5))} total`);
  }
  logger.line();

  // Providers
  logger.bold('  Providers');
  const enabledProviders = status.providers.filter((p) => p.enabled);

  if (enabledProviders.length === 0) {
    logger.log(`  ${pc.dim('No providers enabled')}`);
  } else {
    for (const provider of enabledProviders) {
      const icon = provider.cognitivesCount > 0 ? pc.green('●') : pc.yellow('○');
      const syncStatus =
        provider.cognitivesCount > 0
          ? pc.dim(`(${provider.cognitivesCount} synced)`)
          : pc.dim('(not synced)');
      logger.log(`  ${icon} ${pc.white(provider.name)} ${syncStatus}`);
    }
  }
  logger.line();

  // Last sync
  if (status.lastSync !== undefined) {
    const syncDate = new Date(status.lastSync);
    const relativeTime = getRelativeTime(syncDate);
    logger.log(`  ${pc.dim('Last updated:')} ${relativeTime}`);
    logger.line();
  }

  // Quick actions
  logger.hint('Run /help for available commands.');
}

function getCognitiveIcon(type: CognitiveType): string {
  const icons: Record<CognitiveType, string> = {
    skill: pc.blue('◆'),
    agent: pc.magenta('◆'),
    prompt: pc.yellow('◆'),
    workflow: pc.cyan('◆'),
    tool: pc.green('◆'),
  };
  return icons[type];
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString();
}

// ============================================
// Command Registration
// ============================================

/**
 * Register status command with Commander
 */
export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Show project status')
    .action(() => {
      executeStatusCommand();
    });
}
