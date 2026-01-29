/**
 * Init Command
 *
 * Initialize a new SynapSync project in the current directory
 */

import * as fs from 'fs';
import * as path from 'path';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import type { Command } from 'commander';
import { ConfigManager } from '../services/config/manager.js';
import {
  COGNITIVE_TYPES,
  SUPPORTED_PROVIDERS,
  DEFAULT_SYNAPSYNC_DIR,
  CONFIG_FILE_NAME,
} from '../core/constants.js';
import type { SupportedProvider } from '../core/constants.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface InitOptions {
  name?: string;
  description?: string;
  providers?: SupportedProvider[];
  yes?: boolean; // Skip prompts, use defaults
}

interface InitResult {
  success: boolean;
  projectPath: string;
  configPath: string;
  storagePath: string;
}

// ============================================
// Main Function
// ============================================

/**
 * Execute the init command
 */
export async function executeInitCommand(options: InitOptions = {}): Promise<InitResult | null> {
  const projectRoot = process.cwd();
  const configPath = path.join(projectRoot, CONFIG_FILE_NAME);
  const storagePath = path.join(projectRoot, DEFAULT_SYNAPSYNC_DIR);

  // Check if already initialized
  if (ConfigManager.isProjectInitialized(projectRoot)) {
    logger.line();
    logger.warning('Project already initialized.');
    logger.log(`  ${pc.dim('Config:')} ${configPath}`);
    logger.log(`  ${pc.dim('Storage:')} ${storagePath}`);
    logger.line();
    logger.hint('Use /config to view or modify settings.');
    return null;
  }

  // Non-interactive mode
  if (options.yes === true) {
    return initializeProject({
      name: options.name ?? path.basename(projectRoot),
      ...(options.description !== undefined && { description: options.description }),
      providers: options.providers ?? ['claude'],
    });
  }

  // Interactive mode
  logger.line();
  p.intro(pc.bgCyan(pc.black(' Initialize SynapSync Project ')));

  const result = await p.group(
    {
      name: () => {
        const defaultName = path.basename(projectRoot);
        return p.text({
          message: 'Project name',
          placeholder: defaultName,
          defaultValue: defaultName,
          validate: (value) => {
            // Use defaultValue if empty (user pressed Enter)
            const finalValue = value.trim() === '' ? defaultName : value;
            if (!/^[a-z0-9-_]+$/i.test(finalValue)) {
              return 'Project name can only contain letters, numbers, hyphens, and underscores';
            }
            return undefined;
          },
        });
      },
      description: () =>
        p.text({
          message: 'Description (optional)',
          placeholder: 'A brief description of your project',
        }),
      providers: () =>
        p.multiselect({
          message: 'Select AI providers to enable',
          options: SUPPORTED_PROVIDERS.map((provider) => ({
            value: provider,
            label: getProviderLabel(provider),
            hint: getProviderHint(provider),
          })),
          initialValues: ['claude'],
          required: false,
        }),
    },
    {
      onCancel: () => {
        p.cancel('Project initialization cancelled.');
        return process.exit(0);
      },
    }
  );

  // Type guard for cancelled state
  if (p.isCancel(result)) {
    return null;
  }

  return initializeProject({
    name: result.name,
    description: result.description,
    providers: result.providers as SupportedProvider[],
  });
}

// ============================================
// Project Initialization
// ============================================

interface ProjectSetup {
  name: string;
  description?: string;
  providers: SupportedProvider[];
}

function initializeProject(setup: ProjectSetup): InitResult {
  const projectRoot = process.cwd();
  const configPath = path.join(projectRoot, CONFIG_FILE_NAME);
  const storagePath = path.join(projectRoot, DEFAULT_SYNAPSYNC_DIR);

  const s = p.spinner();
  s.start('Creating project structure...');

  try {
    // 1. Create storage directory with cognitive type subdirectories
    createStorageStructure(storagePath);

    // 2. Create and save configuration
    const configManager = new ConfigManager(projectRoot);
    configManager.create(setup.name, setup.description);

    // Enable selected providers
    for (const provider of setup.providers) {
      configManager.set(`sync.providers.${provider}.enabled`, true);
    }

    configManager.save();

    // 3. Create empty manifest
    createManifest(storagePath);

    // 4. Update .gitignore if exists
    updateGitignore(projectRoot);

    s.stop('Project structure created!');

    // Show success message
    showSuccessMessage(setup, configPath, storagePath);

    return {
      success: true,
      projectPath: projectRoot,
      configPath,
      storagePath,
    };
  } catch (error) {
    s.stop('Failed to create project.');
    logger.line();
    if (error instanceof Error) {
      logger.error(error.message);
    }
    throw error;
  }
}

/**
 * Create the .synapsync directory structure
 */
function createStorageStructure(storagePath: string): void {
  // Create main directory
  fs.mkdirSync(storagePath, { recursive: true });

  // Create subdirectory for each cognitive type
  for (const cognitiveType of COGNITIVE_TYPES) {
    const typePath = path.join(storagePath, `${cognitiveType}s`);
    fs.mkdirSync(typePath, { recursive: true });

    // Create a .gitkeep to preserve empty directories
    const gitkeepPath = path.join(typePath, '.gitkeep');
    fs.writeFileSync(gitkeepPath, '');
  }
}

/**
 * Create empty manifest.json
 */
function createManifest(storagePath: string): void {
  const manifestPath = path.join(storagePath, 'manifest.json');
  const manifest = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    cognitives: {},
    syncs: {},
  };

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
}

/**
 * Update .gitignore to include SynapSync entries
 */
function updateGitignore(projectRoot: string): void {
  const gitignorePath = path.join(projectRoot, '.gitignore');
  const synapsyncEntries = `
# SynapSync
.synapsync/manifest.json
*.local.yaml
`;

  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, 'utf-8');

    // Check if already has SynapSync entries
    if (!content.includes('# SynapSync')) {
      fs.appendFileSync(gitignorePath, synapsyncEntries);
    }
  } else {
    // Create new .gitignore
    fs.writeFileSync(gitignorePath, synapsyncEntries.trim() + '\n');
  }
}

// ============================================
// UI Helpers
// ============================================

function getProviderLabel(provider: SupportedProvider): string {
  const labels: Record<SupportedProvider, string> = {
    claude: 'Claude (Anthropic)',
    openai: 'OpenAI (GPT)',
    gemini: 'Gemini (Google)',
    cursor: 'Cursor IDE',
    windsurf: 'Windsurf IDE',
    copilot: 'GitHub Copilot',
  };
  return labels[provider];
}

function getProviderHint(provider: SupportedProvider): string {
  const hints: Record<SupportedProvider, string> = {
    claude: 'Claude Code, Claude Desktop',
    openai: 'ChatGPT, API',
    gemini: 'Google AI Studio',
    cursor: 'AI-first code editor',
    windsurf: 'AI-powered IDE',
    copilot: 'VS Code integration',
  };
  return hints[provider];
}

function showSuccessMessage(
  setup: ProjectSetup,
  configPath: string,
  storagePath: string
): void {
  logger.line();
  p.note(
    [
      `${pc.dim('Config:')}   ${pc.cyan(configPath)}`,
      `${pc.dim('Storage:')}  ${pc.cyan(storagePath)}`,
      '',
      `${pc.dim('Providers:')} ${setup.providers.map((p) => pc.green(p)).join(', ') || pc.dim('none')}`,
    ].join('\n'),
    `Project "${setup.name}" initialized!`
  );

  logger.line();
  logger.bold('  Next Steps:');
  logger.line();
  logger.log(`  ${pc.cyan('1.')} Connect to providers:`);
  logger.log(`     ${pc.dim('$')} synapsync connect claude`);
  logger.line();
  logger.log(`  ${pc.cyan('2.')} Add cognitives:`);
  logger.log(`     ${pc.dim('$')} synapsync add code-reviewer`);
  logger.log(`     ${pc.dim('$')} synapsync add github:user/my-skill`);
  logger.line();
  logger.log(`  ${pc.cyan('3.')} Sync to providers:`);
  logger.log(`     ${pc.dim('$')} synapsync sync`);
  logger.line();

  p.outro(pc.green('Happy syncing!'));
}

// ============================================
// Command Registration
// ============================================

/**
 * Register init command with Commander
 */
export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Initialize a new SynapSync project')
    .option('-n, --name <name>', 'Project name')
    .option('-d, --description <desc>', 'Project description')
    .option('-p, --provider <providers...>', 'Enable providers (claude, openai, etc.)')
    .option('-y, --yes', 'Skip prompts and use defaults')
    .action(async (options: { name?: string; description?: string; provider?: string[]; yes?: boolean }) => {
      await executeInitCommand({
        ...(options.name !== undefined && { name: options.name }),
        ...(options.description !== undefined && { description: options.description }),
        ...(options.provider !== undefined && { providers: options.provider as SupportedProvider[] }),
        ...(options.yes !== undefined && { yes: options.yes }),
      });
    });
}
