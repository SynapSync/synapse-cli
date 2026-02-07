/**
 * REPL command registrations
 */

import pc from 'picocolors';
import { showBanner, showInfo } from '../banner.js';
import { logger } from '../../utils/logger.js';
import { registerInteractiveCommand } from './registry.js';
import { parseArgs } from './arg-parser.js';
import { executeInfoCommand } from '../../commands/info.js';
import { executeInitCommand } from '../../commands/init.js';
import { executeConfigCommand } from '../../commands/config.js';
import { executeStatusCommand } from '../../commands/status.js';
import { executeProvidersCommand } from '../../commands/providers.js';
import { executeAddCommand } from '../../commands/add.js';
import { executeListCommand } from '../../commands/list.js';
import { executeUninstallCommand } from '../../commands/uninstall.js';
import { executeSyncCommand, executeSyncStatusCommand } from '../../commands/sync.js';
import { executeUpdateCommand } from '../../commands/update.js';
import { executeDoctorCommand } from '../../commands/doctor.js';
import { executeCleanCommand } from '../../commands/clean.js';
import { executePurgeCommand } from '../../commands/purge.js';

// ============================================
// Built-in Commands
// ============================================

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

// ============================================
// Information Commands
// ============================================

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
      { flag: '--add', description: 'How to add from registry, GitHub, local' },
      { flag: '--providers', description: 'Supported AI providers' },
      { flag: '--categories', description: 'Cognitive organization categories' },
      { flag: '--sync', description: 'How synchronization works' },
      { flag: '--structure', description: 'Project directory structure' },
    ],
    examples: ['/info', '/info --cognitives', '/info --add'],
  }
);

registerInteractiveCommand('version', 'Show version information', async (_args) => {
  const { version } = await import('../../version.js');
  logger.line();
  logger.log(`${pc.bold('SynapSync CLI')} ${pc.cyan(`v${version}`)}`);
  logger.line();
  logger.label('Node.js', process.version);
  logger.label('Platform', `${process.platform} ${process.arch}`);
  logger.line();
});

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
// Cognitive Commands
// ============================================

registerInteractiveCommand(
  'add',
  'Add a cognitive from registry, local path, or GitHub',
  async (args) => {
    const { positional, options } = parseArgs(args, [
      { flags: ['--type', '-t'], key: 'type', type: 'string' },
      { flags: ['--category', '-c'], key: 'category', type: 'string' },
      { flags: ['--force', '-f'], key: 'force', type: 'boolean' },
    ]);

    const source = positional[0];
    if (source === undefined || source === '') {
      logger.error('Please specify a cognitive to add.');
      logger.hint('Usage: /add <name|path|github:user/repo>');
      return;
    }

    await executeAddCommand(source, options);
  },
  {
    usage: '/add <source> [options]',
    options: [
      { flag: '-t, --type <type>', description: 'Cognitive type (skill, agent, etc.)' },
      { flag: '-c, --category <cat>', description: 'Category (overrides default)' },
      { flag: '-f, --force', description: 'Overwrite if already installed' },
    ],
    examples: [
      '/add skill-creator',
      '/add ./my-skill',
      '/add github:user/repo',
      '/add skill-creator --force',
    ],
  }
);

registerInteractiveCommand(
  'list',
  'List installed cognitives or browse registry',
  async (args) => {
    const { options } = parseArgs(args, [
      { flags: ['--type', '-t'], key: 'type', type: 'string' },
      { flags: ['--category', '-c'], key: 'category', type: 'string' },
      { flags: ['--tag'], key: 'tag', type: 'string' },
      { flags: ['--remote', '-r'], key: 'remote', type: 'boolean' },
      { flags: ['--json'], key: 'json', type: 'boolean' },
    ]);

    await executeListCommand(options);
  },
  {
    usage: '/list [options]',
    options: [
      { flag: '-t, --type <type>', description: 'Filter by type (skill, agent, prompt, etc.)' },
      { flag: '-c, --category <cat>', description: 'Filter by category' },
      { flag: '--tag <tag>', description: 'Filter by tag (remote only)' },
      { flag: '-r, --remote', description: 'Browse all cognitives in registry' },
      { flag: '--json', description: 'Output as JSON' },
    ],
    examples: ['/list', '/list --remote', '/list --remote --category planning', '/list --type skill'],
  }
);

registerInteractiveCommand(
  'uninstall',
  'Uninstall a cognitive',
  (args) => {
    const { positional, options } = parseArgs(args, [
      { flags: ['--force', '-f'], key: 'force', type: 'boolean' },
      { flags: ['--keep-files'], key: 'keepFiles', type: 'boolean' },
    ]);

    const name = positional[0];
    if (name === undefined || name === '') {
      logger.error('Please specify a cognitive to uninstall.');
      logger.hint('Usage: /uninstall <name> [--force]');
      return;
    }

    executeUninstallCommand(name, options);
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

// ============================================
// Sync Commands
// ============================================

registerInteractiveCommand(
  'sync',
  'Sync cognitives to providers',
  (args) => {
    const { positional, options } = parseArgs(args, [
      { flags: ['--dry-run', '-n'], key: 'dryRun', type: 'boolean' },
      { flags: ['--type', '-t'], key: 'type', type: 'string' },
      { flags: ['--category', '-c'], key: 'category', type: 'string' },
      { flags: ['--provider', '-p'], key: 'provider', type: 'string' },
      { flags: ['--copy'], key: 'copy', type: 'boolean' },
      { flags: ['--force', '-f'], key: 'force', type: 'boolean' },
      { flags: ['--verbose', '-v'], key: 'verbose', type: 'boolean' },
      { flags: ['--json'], key: 'json', type: 'boolean' },
    ]);

    if (positional[0] === 'status') {
      executeSyncStatusCommand({ json: options['json'] === true });
    } else {
      executeSyncCommand(options);
    }
  },
  {
    usage: '/sync [status] [options]',
    options: [
      { flag: 'status', description: 'Show sync status without applying changes' },
      { flag: '-n, --dry-run', description: 'Preview changes without applying' },
      { flag: '-t, --type <type>', description: 'Sync only a specific type' },
      { flag: '-c, --category <cat>', description: 'Sync only a specific category' },
      { flag: '-p, --provider <name>', description: 'Sync only to a specific provider' },
      { flag: '--copy', description: 'Use file copy instead of symlinks' },
      { flag: '-f, --force', description: 'Force sync even if already synced' },
      { flag: '-v, --verbose', description: 'Show detailed output' },
      { flag: '--json', description: 'Output as JSON' },
    ],
    examples: ['/sync', '/sync status', '/sync --dry-run', '/sync --provider claude'],
  }
);

// ============================================
// Maintenance Commands
// ============================================

registerInteractiveCommand(
  'update',
  'Update installed cognitives',
  async (args) => {
    const { positional, options } = parseArgs(args, [
      { flags: ['--all', '-a'], key: 'all', type: 'boolean' },
      { flags: ['--force', '-f'], key: 'force', type: 'boolean' },
      { flags: ['--dry-run', '-n'], key: 'dryRun', type: 'boolean' },
      { flags: ['--json'], key: 'json', type: 'boolean' },
    ]);

    await executeUpdateCommand(positional[0], options);
  },
  {
    usage: '/update [name] [options]',
    options: [
      { flag: '-a, --all', description: 'Update all cognitives' },
      { flag: '-f, --force', description: 'Force update even if current' },
      { flag: '-n, --dry-run', description: 'Preview updates without applying' },
      { flag: '--json', description: 'Output as JSON' },
    ],
    examples: ['/update skill-creator', '/update --all', '/update --dry-run'],
  }
);

registerInteractiveCommand(
  'doctor',
  'Check project health and diagnose issues',
  async (args) => {
    const { options } = parseArgs(args, [
      { flags: ['--fix'], key: 'fix', type: 'boolean' },
      { flags: ['--verbose', '-v'], key: 'verbose', type: 'boolean' },
      { flags: ['--json'], key: 'json', type: 'boolean' },
    ]);

    await executeDoctorCommand(options);
  },
  {
    usage: '/doctor [options]',
    options: [
      { flag: '--fix', description: 'Attempt to fix issues automatically' },
      { flag: '-v, --verbose', description: 'Show detailed output' },
      { flag: '--json', description: 'Output as JSON' },
    ],
    examples: ['/doctor', '/doctor --fix', '/doctor --verbose'],
  }
);

registerInteractiveCommand(
  'clean',
  'Remove orphaned files and fix broken symlinks',
  (args) => {
    const { options } = parseArgs(args, [
      { flags: ['--dry-run', '-n'], key: 'dryRun', type: 'boolean' },
      { flags: ['--force', '-f'], key: 'force', type: 'boolean' },
      { flags: ['--verbose', '-v'], key: 'verbose', type: 'boolean' },
      { flags: ['--json'], key: 'json', type: 'boolean' },
    ]);

    executeCleanCommand(options);
  },
  {
    usage: '/clean [options]',
    options: [
      { flag: '-n, --dry-run', description: 'Preview what would be cleaned' },
      { flag: '-f, --force', description: 'Skip confirmation' },
      { flag: '-v, --verbose', description: 'Show detailed output' },
      { flag: '--json', description: 'Output as JSON' },
    ],
    examples: ['/clean', '/clean --dry-run', '/clean --force'],
  }
);

registerInteractiveCommand(
  'purge',
  'Completely remove SynapSync from the project',
  (args) => {
    const { options } = parseArgs(args, [
      { flags: ['--force', '-f'], key: 'force', type: 'boolean' },
    ]);

    executePurgeCommand(options);
  },
  {
    usage: '/purge [options]',
    options: [
      { flag: '-f, --force', description: 'Skip confirmation and remove everything' },
    ],
    examples: ['/purge', '/purge --force'],
  }
);
