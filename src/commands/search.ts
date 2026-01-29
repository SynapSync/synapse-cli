/**
 * Search Command
 *
 * Search for cognitives in the SynapSync registry
 */

import type { Command } from 'commander';
import pc from 'picocolors';
import { RegistryClient, RegistryError } from '../services/registry/client.js';
import type { SearchOptions } from '../services/registry/client.js';
import { COGNITIVE_TYPES, CATEGORIES } from '../core/constants.js';
import type { CognitiveType, Category } from '../core/constants.js';
import type { RegistryCognitiveEntry } from '../types/index.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface SearchCommandOptions {
  type?: string;
  category?: string;
  tag?: string;
  limit?: string;
  json?: boolean;
}

// ============================================
// Main Function
// ============================================

/**
 * Execute the search command
 */
export async function executeSearchCommand(
  query: string | undefined,
  options: SearchCommandOptions
): Promise<void> {
  logger.line();

  // Validate options
  const validatedOptions = validateOptions(options);
  if (validatedOptions === null) {
    return;
  }

  // Show searching indicator
  const searchingText = query !== undefined && query.trim() !== ''
    ? `Searching for "${query}"...`
    : 'Fetching cognitives from registry...';
  logger.log(`  ${pc.dim(searchingText)}`);

  try {
    const client = new RegistryClient();

    // Check connectivity
    const isReachable = await client.ping();
    if (!isReachable) {
      logger.line();
      logger.error('Unable to reach the registry. Check your internet connection.');
      return;
    }

    // Search
    const searchOpts: SearchOptions = {};
    if (validatedOptions.type !== undefined) searchOpts.type = validatedOptions.type;
    if (validatedOptions.category !== undefined) searchOpts.category = validatedOptions.category;
    if (validatedOptions.tag !== undefined) searchOpts.tag = validatedOptions.tag;
    if (validatedOptions.limit !== undefined) searchOpts.limit = validatedOptions.limit;
    const result = await client.search(query, searchOpts);

    // Clear the searching line
    process.stdout.write('\x1b[1A\x1b[2K');

    if (options.json === true) {
      // JSON output
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    // Display results
    displaySearchResults(result.cognitives, query, result.total);
  } catch (error) {
    logger.line();
    if (error instanceof RegistryError) {
      logger.error(`Registry error: ${error.message}`);
    } else if (error instanceof Error) {
      logger.error(`Search failed: ${error.message}`);
    } else {
      logger.error('Search failed with unknown error');
    }
  }
}

// ============================================
// Validation
// ============================================

interface ValidatedOptions {
  type?: CognitiveType;
  category?: Category;
  tag?: string;
  limit?: number;
}

function validateOptions(options: SearchCommandOptions): ValidatedOptions | null {
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
    validated.category = options.category as Category;
  }

  // Validate tag
  if (options.tag !== undefined) {
    validated.tag = options.tag;
  }

  // Validate limit
  if (options.limit !== undefined) {
    const limit = parseInt(options.limit, 10);
    if (isNaN(limit) || limit < 1) {
      logger.error('Limit must be a positive number');
      return null;
    }
    validated.limit = limit;
  }

  return validated;
}

// ============================================
// Display Functions
// ============================================

function displaySearchResults(
  cognitives: RegistryCognitiveEntry[],
  query: string | undefined,
  total: number
): void {
  // Header
  if (query !== undefined && query.trim() !== '') {
    logger.bold(`  Search Results for "${query}"`);
  } else {
    logger.bold('  Registry Cognitives');
  }
  logger.line();

  if (cognitives.length === 0) {
    logger.log(`  ${pc.dim('No cognitives found')}`);
    logger.line();
    logger.hint('Try a different search query or remove filters.');
    return;
  }

  // Results count
  if (cognitives.length < total) {
    logger.log(`  ${pc.dim(`Showing ${cognitives.length} of ${total} results`)}`);
  } else {
    logger.log(`  ${pc.dim(`Found ${total} cognitive${total === 1 ? '' : 's'}`)}`);
  }
  logger.line();

  // Display each cognitive
  for (const cognitive of cognitives) {
    displayCognitive(cognitive);
  }

  logger.line();
  logger.hint('Run synapsync add <name> to add a cognitive.');
}

function displayCognitive(cognitive: RegistryCognitiveEntry): void {
  const typeIcon = getCognitiveIcon(cognitive.type);
  const typeLabel = pc.dim(`[${cognitive.type}]`);

  // Name and type
  logger.log(`  ${typeIcon} ${pc.bold(pc.white(cognitive.name))} ${typeLabel}`);

  // Description
  logger.log(`    ${pc.dim(truncate(cognitive.description, 60))}`);

  // Metadata line
  const meta: string[] = [];
  meta.push(pc.dim(`v${cognitive.version}`));
  meta.push(pc.dim(cognitive.category));
  if (cognitive.downloads > 0) {
    meta.push(pc.dim(`${cognitive.downloads} downloads`));
  }
  logger.log(`    ${meta.join(' · ')}`);

  // Tags
  if (cognitive.tags.length > 0) {
    const tags = cognitive.tags.slice(0, 5).map((t) => pc.cyan(t)).join(' ');
    logger.log(`    ${tags}`);
  }

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

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

// ============================================
// Command Registration
// ============================================

/**
 * Register search command with Commander
 */
export function registerSearchCommand(program: Command): void {
  program
    .command('search [query]')
    .description('Search for cognitives in the registry')
    .option('-t, --type <type>', 'Filter by type (skill, agent, prompt, workflow, tool)')
    .option('-c, --category <category>', 'Filter by category')
    .option('--tag <tag>', 'Filter by tag')
    .option('-l, --limit <number>', 'Limit results', '20')
    .option('--json', 'Output as JSON')
    .action(async (query: string | undefined, options: SearchCommandOptions) => {
      await executeSearchCommand(query, options);
    });
}
