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

// Available commands in interactive mode
const COMMANDS: Record<
  string,
  { description: string; handler: (args: string) => void | Promise<void> }
> = {};

// Register a command for interactive mode
export function registerInteractiveCommand(
  name: string,
  description: string,
  handler: (args: string) => void | Promise<void>
): void {
  COMMANDS[name] = { description, handler };
}

// ============================================
// Built-in Commands
// ============================================

registerInteractiveCommand('help', 'Show available commands', (_args) => {
  logger.line();
  logger.bold('  Available Commands:');
  logger.line();

  // Built-in commands
  logger.log(`  ${pc.cyan('/help')}              ${pc.dim('Show this help message')}`);
  logger.log(`  ${pc.cyan('/clear')}             ${pc.dim('Clear the screen')}`);
  logger.log(`  ${pc.cyan('/exit')}              ${pc.dim('Exit interactive mode')}`);
  logger.line();

  // Registered commands
  const commandNames = Object.keys(COMMANDS).filter(
    (name) => !['help', 'clear', 'exit'].includes(name)
  );

  if (commandNames.length > 0) {
    logger.bold('  CLI Commands:');
    logger.line();
    for (const name of commandNames.sort()) {
      const cmd = COMMANDS[name];
      const paddedName = `/${name}`.padEnd(18);
      logger.log(`  ${pc.cyan(paddedName)} ${pc.dim(cmd?.description ?? '')}`);
    }
    logger.line();
  }
});

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

registerInteractiveCommand('info', 'Show information about SynapSync concepts', (args) => {
  executeInfoCommand(args);
});

// ============================================
// Project Commands
// ============================================

registerInteractiveCommand('init', 'Initialize a new project', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 2.');
});

registerInteractiveCommand('config', 'Manage configuration', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 2.');
});

registerInteractiveCommand('status', 'Show project status', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 2.');
});

// ============================================
// Provider Commands
// ============================================

registerInteractiveCommand('connect', 'Connect to AI providers', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 3.');
});

registerInteractiveCommand('disconnect', 'Disconnect from a provider', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 3.');
});

registerInteractiveCommand('providers', 'List connected providers', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 3.');
});

// ============================================
// Asset Commands (skills, agents, prompts, etc.)
// ============================================

registerInteractiveCommand('search', 'Search for assets in registry', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('install', 'Install an asset (skill, agent, prompt)', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('list', 'List installed assets', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('uninstall', 'Uninstall an asset', (_args) => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

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
