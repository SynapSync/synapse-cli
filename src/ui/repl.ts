/**
 * Interactive REPL (Read-Eval-Print Loop) for SynapSync CLI
 * Allows users to run commands interactively without leaving the CLI
 */

import * as readline from 'readline';
import pc from 'picocolors';
import { showBanner, showError, showInfo } from './banner.js';
import { CLI_NAME } from '../core/constants.js';
import { logger } from '../utils/logger.js';
import { executeInfoCommand } from '../commands/info.js';
import { executeInitCommand } from '../commands/init.js';
import { executeConfigCommand } from '../commands/config.js';
import { executeStatusCommand } from '../commands/status.js';
import { executeProvidersCommand } from '../commands/providers.js';
import { executeSearchCommand } from '../commands/search.js';
import { executeInstallCommand } from '../commands/install.js';
import { executeListCommand } from '../commands/list.js';
import { executeUninstallCommand } from '../commands/uninstall.js';

// Command definition with usage info
interface CommandDef {
  description: string;
  usage?: string;
  options?: Array<{ flag: string; description: string }>;
  examples?: string[];
  handler: (args: string) => void | Promise<void>;
}

// Available commands in interactive mode
const COMMANDS: Record<string, CommandDef> = {};

// Register a command for interactive mode
export function registerInteractiveCommand(
  name: string,
  description: string,
  handler: (args: string) => void | Promise<void>,
  options?: {
    usage?: string;
    options?: Array<{ flag: string; description: string }>;
    examples?: string[];
  }
): void {
  COMMANDS[name] = {
    description,
    handler,
    usage: options?.usage,
    options: options?.options,
    examples: options?.examples,
  };
}

// Show detailed help for a specific command
function showCommandHelp(commandName: string): void {
  const cmd = COMMANDS[commandName];
  if (!cmd) {
    showError(`Unknown command: /${commandName}`);
    return;
  }

  logger.line();
  logger.log(pc.bold(pc.cyan(`  /${commandName}`)) + pc.dim(` - ${cmd.description}`));
  logger.line();

  if (cmd.usage) {
    logger.log(pc.bold('  Usage:'));
    logger.log(`    ${pc.cyan(cmd.usage)}`);
    logger.line();
  }

  if (cmd.options && cmd.options.length > 0) {
    logger.log(pc.bold('  Options:'));
    for (const opt of cmd.options) {
      logger.log(`    ${pc.yellow(opt.flag.padEnd(16))} ${pc.dim(opt.description)}`);
    }
    logger.line();
  }

  if (cmd.examples && cmd.examples.length > 0) {
    logger.log(pc.bold('  Examples:'));
    for (const example of cmd.examples) {
      logger.log(`    ${pc.dim('$')} ${pc.cyan(example)}`);
    }
    logger.line();
  }
}

// ============================================
// Built-in Commands
// ============================================

registerInteractiveCommand(
  'help',
  'Show available commands or help for a specific command',
  (args) => {
    const commandName = args.trim().toLowerCase().replace(/^\//, '');

    // If a command name is provided, show detailed help
    if (commandName) {
      showCommandHelp(commandName);
      return;
    }

    // Show general help
    logger.line();
    logger.bold('  Available Commands:');
    logger.line();

    // Built-in commands
    logger.log(`  ${pc.cyan('/help [command]')}    ${pc.dim('Show help (or help for a command)')}`);
    logger.log(`  ${pc.cyan('/clear')}             ${pc.dim('Clear the screen')}`);
    logger.log(`  ${pc.cyan('/exit')}              ${pc.dim('Exit interactive mode')}`);
    logger.line();

    // Registered commands by category
    const categories: Record<string, string[]> = {
      'Information': ['info', 'version'],
      'Project': ['init', 'config', 'status'],
      'Providers': ['providers'],
      'Cognitives': ['search', 'install', 'list', 'uninstall', 'create'],
      'Sync': ['sync', 'push', 'pull'],
    };

    for (const [category, cmds] of Object.entries(categories)) {
      const availableCmds = cmds.filter((name) => COMMANDS[name]);
      if (availableCmds.length > 0) {
        logger.bold(`  ${category}:`);
        for (const name of availableCmds) {
          const cmd = COMMANDS[name];
          const hasOptions = cmd?.options !== undefined && cmd.options.length > 0;
          const paddedName = `/${name}`.padEnd(18);
          const optionsHint = hasOptions ? pc.yellow(' [options]') : '';
          logger.log(`  ${pc.cyan(paddedName)} ${pc.dim(cmd?.description ?? '')}${optionsHint}`);
        }
        logger.line();
      }
    }

    logger.hint('Tip: Use /help <command> for detailed help. Example: /help info');
    logger.line();
  },
  {
    usage: '/help [command]',
    examples: ['/help', '/help info', '/help install'],
  }
);

registerInteractiveCommand('clear', 'Clear the screen', (_args) => {
  logger.clear();
  showBanner();
});

registerInteractiveCommand('exit', 'Exit interactive mode', (_args) => {
  logger.line();
  showInfo('Goodbye! Run `synapsync` to start again.');
  logger.line();
  process.exit(0);
});

registerInteractiveCommand(
  'info',
  'Show information about SynapSync concepts',
  (args) => {
    executeInfoCommand(args);
  },
  {
    usage: '/info [--topic]',
    options: [
      { flag: '--cognitives', description: 'Types of AI cognitives (skills, agents, etc.)' },
      { flag: '--install', description: 'How to install from registry, GitHub, local' },
      { flag: '--providers', description: 'Supported AI providers' },
      { flag: '--categories', description: 'Cognitive organization categories' },
      { flag: '--sync', description: 'How synchronization works' },
      { flag: '--structure', description: 'Project directory structure' },
    ],
    examples: ['/info', '/info --cognitives', '/info --install'],
  }
);

// ============================================
// Project Commands
// ============================================

registerInteractiveCommand(
  'init',
  'Initialize a new SynapSync project',
  async (_args) => {
    await executeInitCommand();
  },
  {
    usage: '/init [options]',
    options: [
      { flag: '-n, --name', description: 'Project name' },
      { flag: '-y, --yes', description: 'Skip prompts, use defaults' },
    ],
    examples: ['/init', '/init --name my-project', '/init --yes'],
  }
);

registerInteractiveCommand(
  'config',
  'Manage project configuration',
  (args) => {
    executeConfigCommand(args);
  },
  {
    usage: '/config [list|get|set] [key] [value]',
    options: [
      { flag: 'list', description: 'Show all configuration values' },
      { flag: 'get <key>', description: 'Get a specific value' },
      { flag: 'set <key> <value>', description: 'Set a configuration value' },
    ],
    examples: ['/config', '/config list', '/config get cli.theme', '/config set cli.theme dark'],
  }
);

registerInteractiveCommand(
  'status',
  'Show project status',
  (_args) => {
    executeStatusCommand();
  },
  {
    usage: '/status',
    examples: ['/status'],
  }
);

// ============================================
// Provider Commands
// ============================================

registerInteractiveCommand(
  'providers',
  'Manage provider configuration',
  (args) => {
    executeProvidersCommand(args);
  },
  {
    usage: '/providers [list|enable|disable|path] [args]',
    options: [
      { flag: 'list', description: 'List all providers and status (default)' },
      { flag: 'enable <provider>', description: 'Enable a provider' },
      { flag: 'disable <provider>', description: 'Disable a provider' },
      { flag: 'path <provider> <path>', description: 'Set custom sync path' },
    ],
    examples: [
      '/providers',
      '/providers enable openai',
      '/providers disable cursor',
      '/providers path claude .claude-code/',
    ],
  }
);

// ============================================
// Asset Commands (skills, agents, prompts, etc.)
// ============================================

registerInteractiveCommand(
  'search',
  'Search for cognitives in the registry',
  async (args) => {
    // Parse args to extract query and options
    const parts = args.split(/\s+/);
    let query: string | undefined;
    const options: Record<string, string | boolean> = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === undefined || part === '') continue;

      if (part === '--type' || part === '-t') {
        options.type = parts[++i] ?? '';
      } else if (part === '--category' || part === '-c') {
        options.category = parts[++i] ?? '';
      } else if (part === '--tag') {
        options.tag = parts[++i] ?? '';
      } else if (part === '--limit' || part === '-l') {
        options.limit = parts[++i] ?? '20';
      } else if (part === '--json') {
        options.json = true;
      } else if (!part.startsWith('-')) {
        query = part;
      }
    }

    await executeSearchCommand(query, options);
  },
  {
    usage: '/search [query] [options]',
    options: [
      { flag: '-t, --type <type>', description: 'Filter by type (skill, agent, prompt, etc.)' },
      { flag: '-c, --category <cat>', description: 'Filter by category' },
      { flag: '--tag <tag>', description: 'Filter by tag' },
      { flag: '-l, --limit <n>', description: 'Limit results (default: 20)' },
      { flag: '--json', description: 'Output as JSON' },
    ],
    examples: ['/search', '/search react', '/search --type skill', '/search api --category backend'],
  }
);

registerInteractiveCommand(
  'install',
  'Install a cognitive from registry, local path, or GitHub',
  async (args) => {
    const parts = args.split(/\s+/);
    let source: string | undefined;
    const options: Record<string, string | boolean> = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === undefined || part === '') continue;

      if (part === '--type' || part === '-t') {
        options.type = parts[++i] ?? '';
      } else if (part === '--category' || part === '-c') {
        options.category = parts[++i] ?? '';
      } else if (part === '--force' || part === '-f') {
        options.force = true;
      } else if (!part.startsWith('-')) {
        source = part;
      }
    }

    if (source === undefined || source === '') {
      logger.error('Please specify a cognitive to install.');
      logger.hint('Usage: /install <name|path|github:user/repo>');
      return;
    }

    await executeInstallCommand(source, options);
  },
  {
    usage: '/install <source> [options]',
    options: [
      { flag: '-t, --type <type>', description: 'Cognitive type (skill, agent, etc.)' },
      { flag: '-c, --category <cat>', description: 'Category (overrides default)' },
      { flag: '-f, --force', description: 'Overwrite if already installed' },
    ],
    examples: [
      '/install skill-creator',
      '/install ./my-skill',
      '/install github:user/repo',
      '/install skill-creator --force',
    ],
  }
);

registerInteractiveCommand(
  'list',
  'List installed cognitives',
  async (args) => {
    const parts = args.split(/\s+/);
    const options: Record<string, string | boolean> = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === undefined || part === '') continue;

      if (part === '--type' || part === '-t') {
        options.type = parts[++i] ?? '';
      } else if (part === '--category' || part === '-c') {
        options.category = parts[++i] ?? '';
      } else if (part === '--json') {
        options.json = true;
      }
    }

    await executeListCommand(options);
  },
  {
    usage: '/list [options]',
    options: [
      { flag: '-t, --type <type>', description: 'Filter by type (skill, agent, prompt, etc.)' },
      { flag: '-c, --category <cat>', description: 'Filter by category' },
      { flag: '--json', description: 'Output as JSON' },
    ],
    examples: ['/list', '/list --type skill', '/list --category backend'],
  }
);

registerInteractiveCommand(
  'uninstall',
  'Uninstall a cognitive',
  async (args) => {
    const parts = args.split(/\s+/);
    let name: string | undefined;
    const options: Record<string, boolean> = {};

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (part === undefined || part === '') continue;

      if (part === '--force' || part === '-f') {
        options.force = true;
      } else if (part === '--keep-files') {
        options.keepFiles = true;
      } else if (!part.startsWith('-')) {
        name = part;
      }
    }

    if (name === undefined || name === '') {
      logger.error('Please specify a cognitive to uninstall.');
      logger.hint('Usage: /uninstall <name> [--force]');
      return;
    }

    await executeUninstallCommand(name, options);
  },
  {
    usage: '/uninstall <name> [options]',
    options: [
      { flag: '-f, --force', description: 'Skip confirmation' },
      { flag: '--keep-files', description: 'Remove from manifest but keep files' },
    ],
    examples: ['/uninstall skill-creator', '/uninstall my-agent --force'],
  }
);

registerInteractiveCommand('create', 'Create a new asset', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 2.');
});

// ============================================
// Sync Commands
// ============================================

registerInteractiveCommand('sync', 'Sync assets to providers', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 2 Week 6.');
});

registerInteractiveCommand('push', 'Push local assets to registry', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 2.');
});

registerInteractiveCommand('pull', 'Pull latest assets from registry', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 2.');
});

// ============================================
// Utility Commands
// ============================================

registerInteractiveCommand('version', 'Show version information', async (_args) => {
  const { version } = await import('../version.js');
  logger.line();
  logger.log(`${pc.bold('SynapSync CLI')} ${pc.cyan(`v${version}`)}`);
  logger.line();
  logger.label('Node.js', process.version);
  logger.label('Platform', `${process.platform} ${process.arch}`);
  logger.line();
});

/**
 * Parse command input and execute
 */
async function executeCommand(input: string): Promise<void> {
  const trimmed = input.trim();

  if (!trimmed) {
    return;
  }

  // Commands must start with /
  if (!trimmed.startsWith('/')) {
    showError(`Unknown input. Commands must start with /`);
    logger.log(`${pc.dim('Type')} ${pc.cyan('/help')} ${pc.dim('for available commands.')}`);
    return;
  }

  // Parse command and arguments
  const parts = trimmed.slice(1).split(/\s+/);
  const commandName = parts[0]?.toLowerCase();
  const args = parts.slice(1).join(' ');

  if (!commandName) {
    return;
  }

  const command = COMMANDS[commandName];

  if (!command) {
    showError(`Unknown command: /${commandName}`);
    logger.log(`${pc.dim('Type')} ${pc.cyan('/help')} ${pc.dim('for available commands.')}`);
    return;
  }

  try {
    await command.handler(args);
  } catch (error) {
    if (error instanceof Error) {
      showError(error.message);
    } else {
      showError('An unexpected error occurred');
    }
  }
}

/**
 * Start the interactive REPL
 */
export function startInteractiveMode(): void {
  // Show banner first
  showBanner();

  logger.log(
    `${pc.dim('Type')} ${pc.cyan('/help')} ${pc.dim('for commands,')} ${pc.cyan('/exit')} ${pc.dim('to quit.')}`
  );
  logger.line();

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${pc.green(CLI_NAME)} ${pc.dim('>')} `,
    terminal: true,
  });

  // Handle line input
  rl.on('line', (line) => {
    void executeCommand(line).then(() => {
      rl.prompt();
    });
  });

  // Handle close (Ctrl+C, Ctrl+D)
  rl.on('close', () => {
    logger.line();
    showInfo('Goodbye!');
    process.exit(0);
  });

  // Handle SIGINT (Ctrl+C)
  rl.on('SIGINT', () => {
    logger.line();
    logger.hint('(Use /exit to quit or Ctrl+D)');
    rl.prompt();
  });

  // Start the prompt
  rl.prompt();
}
