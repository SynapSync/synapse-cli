/**
 * List Command
 *
 * List installed cognitives or browse registry
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Command } from 'commander';
import pc from 'picocolors';
import { ConfigManager } from '../services/config/manager.js';
import { RegistryClient } from '../services/registry/client.js';
import { COGNITIVE_TYPES, CATEGORIES } from '../core/constants.js';
import type { CognitiveType, Category } from '../core/constants.js';
import type { InstalledCognitive, RegistryCognitiveEntry } from '../types/index.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface ListCommandOptions {
  type?: string;
  category?: string;
  tag?: string;
  json?: boolean;
  remote?: boolean;
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
 * Execute the list command
 */
export async function executeListCommand(options: ListCommandOptions): Promise<void> {
  logger.line();

  // Remote mode: list all cognitives from registry
  if (options.remote === true) {
    await listRemoteCognitives(options);
    return;
  }

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

  // Read manifest
  const manifest = readManifest(configManager);

  if (options.json === true) {
    // JSON output
    const cognitives = Object.values(manifest.cognitives);
    const filtered = filterCognitives(cognitives, validatedOptions);
    console.log(JSON.stringify(filtered, null, 2));
    return;
  }

  // Display results
  displayCognitives(manifest, validatedOptions);
}

// ============================================
// Remote Registry Listing
// ============================================

async function listRemoteCognitives(options: ListCommandOptions): Promise<void> {
  const client = new RegistryClient();

  logger.log(`  ${pc.dim('Fetching registry...')}`);

  try {
    const cognitives = await client.list();

    // Validate and filter
    const validatedOptions = validateOptions(options);
    if (validatedOptions === null) {
      return;
    }

    const filtered = filterRemoteCognitives(cognitives, validatedOptions);

    if (options.json === true) {
      console.log(JSON.stringify(filtered, null, 2));
      return;
    }

    // Display results
    displayRemoteCognitives(filtered);
  } catch (error) {
    logger.error(`Failed to fetch registry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function filterRemoteCognitives(
  cognitives: RegistryCognitiveEntry[],
  options: ValidatedOptions
): RegistryCognitiveEntry[] {
  return cognitives.filter((c) => {
    if (options.type !== undefined && c.type !== options.type) {
      return false;
    }
    if (options.category !== undefined && c.category !== options.category) {
      return false;
    }
    if (options.tag !== undefined) {
      const tag = options.tag;
      if (!c.tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}

function displayRemoteCognitives(cognitives: RegistryCognitiveEntry[]): void {
  logger.line();
  logger.bold('  Available Cognitives (Registry)');
  logger.line();

  if (cognitives.length === 0) {
    logger.log(`  ${pc.dim('No cognitives found in registry.')}`);
    return;
  }

  // Group by type
  const grouped: Record<string, RegistryCognitiveEntry[]> = {};
  for (const cognitive of cognitives) {
    grouped[cognitive.type] ??= [];
    (grouped[cognitive.type] as RegistryCognitiveEntry[]).push(cognitive);
  }

  for (const [type, items] of Object.entries(grouped)) {
    const typeIcon = getCognitiveIcon(type as CognitiveType);
    const typeLabel = `${type}s`;
    logger.log(`  ${typeIcon} ${pc.bold(typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1))} (${items.length})`);
    logger.line();

    for (const cognitive of items) {
      // Name and version
      logger.log(`    ${pc.white(cognitive.name)} ${pc.dim(`v${cognitive.version}`)}`);

      // Description (truncated)
      if (cognitive.description) {
        const desc = cognitive.description.length > 60
          ? cognitive.description.slice(0, 57) + '...'
          : cognitive.description;
        logger.log(`      ${pc.dim(desc)}`);
      }

      // Details
      const details: string[] = [];
      details.push(pc.dim(cognitive.category));
      if (cognitive.author) {
        details.push(pc.dim(`by ${cognitive.author}`));
      }
      logger.log(`      ${details.join(' · ')}`);

      // Tags
      if (cognitive.tags !== undefined && cognitive.tags.length > 0) {
        const tagsStr = cognitive.tags.slice(0, 5).join(' ');
        logger.log(`      ${pc.cyan(tagsStr)}`);
      }

      logger.line();
    }
  }

  // Summary
  logger.log(`  ${pc.dim(`Total: ${cognitives.length} cognitive${cognitives.length === 1 ? '' : 's'} available`)}`);
  logger.line();
  logger.hint('Run synapsync add <name> to add a cognitive.');
}

// ============================================
// Validation
// ============================================

interface ValidatedOptions {
  type?: CognitiveType;
  category?: Category;
  tag?: string;
}

function validateOptions(options: ListCommandOptions): ValidatedOptions | null {
  const validated: ValidatedOptions = {};

  // Validate type
  if (options.type !== undefined) {
    if (!COGNITIVE_TYPES.includes(options.type as CognitiveType)) {
      logger.error(`Invalid type: ${options.type}`);
      logger.hint(`Valid types: ${COGNITIVE_TYPES.join(', ')}`);
      return null;
    }
    validated.type = options.type as CognitiveType;
  }

  // Validate category
  if (options.category !== undefined) {
    if (!(CATEGORIES as readonly string[]).includes(options.category)) {
      logger.error(`Invalid category: ${options.category}`);
      logger.hint(`Valid categories: ${CATEGORIES.join(', ')}`);
      return null;
    }
    validated.category = options.category;
  }

  // Validate tag
  if (options.tag !== undefined) {
    validated.tag = options.tag;
  }

  return validated;
}

// ============================================
// Manifest Reading
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

function filterCognitives(
  cognitives: InstalledCognitive[],
  options: ValidatedOptions
): InstalledCognitive[] {
  return cognitives.filter((c) => {
    if (options.type !== undefined && c.type !== options.type) {
      return false;
    }
    if (options.category !== undefined && c.category !== options.category) {
      return false;
    }
    return true;
  });
}

// ============================================
// Display Functions
// ============================================

function displayCognitives(manifest: ProjectManifest, options: ValidatedOptions): void {
  const cognitives = Object.values(manifest.cognitives);
  const filtered = filterCognitives(cognitives, options);

  // Header
  logger.bold('  Installed Cognitives');
  logger.line();

  if (filtered.length === 0) {
    if (cognitives.length === 0) {
      logger.log(`  ${pc.dim('No cognitives installed yet.')}`);
      logger.line();
      logger.hint('Run synapsync list --remote to browse available cognitives.');
    } else {
      logger.log(`  ${pc.dim('No cognitives match the specified filters.')}`);
      logger.line();
      logger.hint('Try removing filters to see all installed cognitives.');
    }
    return;
  }

  // Group by type
  const grouped = groupByType(filtered);

  for (const [type, items] of Object.entries(grouped)) {
    const typeIcon = getCognitiveIcon(type as CognitiveType);
    const typeLabel = `${type}s`;
    logger.log(`  ${typeIcon} ${pc.bold(typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1))} (${items.length})`);
    logger.line();

    for (const cognitive of items) {
      displayCognitive(cognitive);
    }
  }

  // Summary
  logger.line();
  logger.log(`  ${pc.dim(`Total: ${filtered.length} cognitive${filtered.length === 1 ? '' : 's'}`)}`);
  logger.line();
  logger.hint('Run synapsync uninstall <name> to remove a cognitive.');
}

function groupByType(cognitives: InstalledCognitive[]): Record<string, InstalledCognitive[]> {
  const grouped: Record<string, InstalledCognitive[]> = {};

  for (const cognitive of cognitives) {
    grouped[cognitive.type] ??= [];
    (grouped[cognitive.type] as InstalledCognitive[]).push(cognitive);
  }

  return grouped;
}

function displayCognitive(cognitive: InstalledCognitive): void {
  // Name and version
  logger.log(`    ${pc.white(cognitive.name)} ${pc.dim(`v${cognitive.version}`)}`);

  // Details
  const details: string[] = [];
  details.push(pc.dim(cognitive.category));
  details.push(pc.dim(`from ${cognitive.source}`));

  if (cognitive.installedAt !== undefined) {
    const date = new Date(cognitive.installedAt);
    details.push(pc.dim(`installed ${formatDate(date)}`));
  }

  logger.log(`      ${details.join(' · ')}`);
  logger.line();
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

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
  } else {
    return date.toLocaleDateString();
  }
}

// ============================================
// Command Registration
// ============================================

/**
 * Register list command with Commander
 */
export function registerListCommand(program: Command): void {
  program
    .command('list')
    .alias('ls')
    .description('List installed cognitives or browse registry')
    .option('-t, --type <type>', 'Filter by type (skill, agent, prompt, workflow, tool)')
    .option('-c, --category <category>', 'Filter by category')
    .option('--tag <tag>', 'Filter by tag (remote only)')
    .option('-r, --remote', 'List all cognitives available in the registry')
    .option('--json', 'Output as JSON')
    .action(async (options: ListCommandOptions) => {
      await executeListCommand(options);
    });
}
