/**
 * Interactive REPL (Read-Eval-Print Loop) for SynapSync CLI
 * Allows users to run commands interactively without leaving the CLI
 */

import * as readline from 'readline';
import pc from 'picocolors';
import { showBanner, showError, showInfo } from './banner.js';
import { CLI_NAME } from '../core/constants.js';

// Available commands in interactive mode
const COMMANDS: Record<string, { description: string; handler: (args: string[]) => Promise<void> }> =
  {};

// Register a command for interactive mode
export function registerInteractiveCommand(
  name: string,
  description: string,
  handler: (args: string[]) => Promise<void>
): void {
  COMMANDS[name] = { description, handler };
}

// Built-in commands
registerInteractiveCommand('help', 'Show available commands', async () => {
  console.log();
  console.log(pc.bold('  Available Commands:'));
  console.log();

  // Built-in commands
  console.log(`  ${pc.cyan('/help')}              ${pc.dim('Show this help message')}`);
  console.log(`  ${pc.cyan('/clear')}             ${pc.dim('Clear the screen')}`);
  console.log(`  ${pc.cyan('/exit')}              ${pc.dim('Exit interactive mode')}`);
  console.log();

  // Registered commands
  const commandNames = Object.keys(COMMANDS).filter(
    (name) => !['help', 'clear', 'exit'].includes(name)
  );

  if (commandNames.length > 0) {
    console.log(pc.bold('  CLI Commands:'));
    console.log();
    for (const name of commandNames.sort()) {
      const cmd = COMMANDS[name];
      const paddedName = `/${name}`.padEnd(18);
      console.log(`  ${pc.cyan(paddedName)} ${pc.dim(cmd?.description ?? '')}`);
    }
    console.log();
  }
});

registerInteractiveCommand('clear', 'Clear the screen', async () => {
  console.clear();
  showBanner();
});

registerInteractiveCommand('exit', 'Exit interactive mode', async () => {
  console.log();
  showInfo('Goodbye! Run `synapsync` to start again.');
  console.log();
  process.exit(0);
});

// Placeholder commands - will be replaced when actual commands are implemented
registerInteractiveCommand('init', 'Initialize a new project', async () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 2.');
});

registerInteractiveCommand('config', 'Manage configuration', async () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 2.');
});

registerInteractiveCommand('connect', 'Connect to AI providers', async () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 3.');
});

registerInteractiveCommand('disconnect', 'Disconnect from a provider', async () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 3.');
});

registerInteractiveCommand('providers', 'List connected providers', async () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 3.');
});

registerInteractiveCommand('search', 'Search for skills', async () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('install', 'Install a skill', async () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('list', 'List installed skills', async () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('info', 'Show skill information', async () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('uninstall', 'Uninstall a skill', async () => {
  showInfo('Command not yet implemented. Coming in Phase 1 Week 4.');
});

registerInteractiveCommand('sync', 'Sync skills to providers', async () => {
  showInfo('Command not yet implemented. Coming in Phase 2 Week 6.');
});

registerInteractiveCommand('status', 'Show project status', async () => {
  showInfo('Command not yet implemented. Coming in Phase 2 Week 6.');
});

registerInteractiveCommand('version', 'Show version information', async () => {
  const { version } = await import('../version.js');
  console.log();
  console.log(`${pc.bold('SynapSync CLI')} ${pc.cyan(`v${version}`)}`);
  console.log();
  console.log(`${pc.dim('Node.js:')}    ${process.version}`);
  console.log(`${pc.dim('Platform:')}   ${process.platform} ${process.arch}`);
  console.log();
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
    console.log(`${pc.dim('Type')} ${pc.cyan('/help')} ${pc.dim('for available commands.')}`);
    return;
  }

  // Parse command and arguments
  const parts = trimmed.slice(1).split(/\s+/);
  const commandName = parts[0]?.toLowerCase();
  const args = parts.slice(1);

  if (!commandName) {
    return;
  }

  const command = COMMANDS[commandName];

  if (!command) {
    showError(`Unknown command: /${commandName}`);
    console.log(`${pc.dim('Type')} ${pc.cyan('/help')} ${pc.dim('for available commands.')}`);
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
export async function startInteractiveMode(): Promise<void> {
  // Show banner first
  showBanner();

  console.log(
    `${pc.dim('Type')} ${pc.cyan('/help')} ${pc.dim('for commands,')} ${pc.cyan('/exit')} ${pc.dim('to quit.')}`
  );
  console.log();

  // Create readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${pc.green(CLI_NAME)} ${pc.dim('>')} `,
    terminal: true,
  });

  // Handle line input
  rl.on('line', async (line) => {
    await executeCommand(line);
    rl.prompt();
  });

  // Handle close (Ctrl+C, Ctrl+D)
  rl.on('close', () => {
    console.log();
    showInfo('Goodbye!');
    process.exit(0);
  });

  // Handle SIGINT (Ctrl+C)
  rl.on('SIGINT', () => {
    console.log();
    console.log(pc.dim('(Use /exit to quit or Ctrl+D)'));
    rl.prompt();
  });

  // Start the prompt
  rl.prompt();
}
