/**
 * CLI setup with Commander.js
 */

import { Command } from 'commander';
import { CLI_NAME, CLI_DESCRIPTION } from './core/constants.js';
import { showBanner } from './ui/banner.js';
import { version } from './version.js';

// Import commands
import { registerHelpCommand } from './commands/help.js';
import { registerVersionCommand } from './commands/version.js';

export function createCLI(): Command {
  const program = new Command();

  program
    .name(CLI_NAME)
    .description(CLI_DESCRIPTION)
    .version(version, '-v, --version', 'Show CLI version')
    .option('--verbose', 'Enable verbose output')
    .option('--no-color', 'Disable colored output')
    .hook('preAction', (_thisCommand, _actionCommand) => {
      // Global pre-action hook for logging, etc.
    });

  // Show banner when no command is provided
  program.action(() => {
    showBanner();
  });

  // Register commands
  registerHelpCommand(program);
  registerVersionCommand(program);

  // TODO: Register more commands as they are implemented
  // registerInitCommand(program);
  // registerConfigCommand(program);
  // registerConnectCommand(program);
  // registerProvidersCommand(program);
  // registerSearchCommand(program);
  // registerInstallCommand(program);
  // registerListCommand(program);
  // registerInfoCommand(program);
  // registerUninstallCommand(program);
  // registerSyncCommand(program);
  // registerStatusCommand(program);

  return program;
}

export async function runCLI(args: string[] = process.argv): Promise<void> {
  const program = createCLI();

  try {
    await program.parseAsync(args);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
      if (process.env['DEBUG']) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}
