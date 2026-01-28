/**
 * Interactive REPL (Read-Eval-Print Loop) for SynapSync CLI
 * Allows users to run commands interactively without leaving the CLI
 */

import * as readline from 'readline';
import pc from 'picocolors';
import { showBanner, showError, showInfo } from './banner.js';
import { CLI_NAME } from '../core/constants.js';
import { logger } from '../utils/logger.js';

// Available commands in interactive mode
const COMMANDS: Record<string, { description: string; handler: () => void | Promise<void> }> = {};

// Register a command for interactive mode
export function registerInteractiveCommand(
  name: string,
  description: string,
  handler: () => void | Promise<void>
): void {
  COMMANDS[name] = { description, handler };
}

// Built-in commands
registerInteractiveCommand('help', 'Show available commands', () => {
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

registerInteractiveCommand('clear', 'Clear the screen', () => {
  logger.clear();
  showBanner();
});

registerInteractiveCommand('exit', 'Exit interactive mode', () => {
  logger.line();
  showInfo('Goodbye! Run `synapsync` to start again.');
  logger.line();
  process.exit(0);
});

// Placeholder commands - will be replaced when actual commands are implemented
registerInteractiveCommand('init', 'Initialize a new project', () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 2.');
});

registerInteractiveCommand('config', 'Manage configuration', () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 2.');
});

registerInteractiveCommand('connect', 'Connect to AI providers', () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 3.');
});

registerInteractiveCommand('disconnect', 'Disconnect from a provider', () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 3.');
});

registerInteractiveCommand('providers', 'List connected providers', () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 3.');
});

registerInteractiveCommand('search', 'Search for skills', () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('install', 'Install a skill', () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('list', 'List installed skills', () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('info', 'Show skill information', () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('uninstall', 'Uninstall a skill', () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('sync', 'Sync skills to providers', () => {
  showInfo('Command not yet implemented. Coming in Phase 2 Week 6.');
});

registerInteractiveCommand('status', 'Show project status', () => {
  showInfo('Command not yet implemented. Coming in Phase 2 Week 6.');
});

registerInteractiveCommand('version', 'Show version information', async () => {
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
    await command.handler();
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
