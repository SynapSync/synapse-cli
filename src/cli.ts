/**
 * CLI setup with Commander.js
 */

import { Command } from 'commander';
import { CLI_NAME, CLI_DESCRIPTION } from './core/constants.js';
import { startInteractiveMode } from './ui/repl.js';
import { version } from './version.js';
import { logger } from './utils/logger.js';

// Import commands
import { registerHelpCommand } from './commands/help.js';
import { registerVersionCommand } from './commands/version.js';
import { registerInfoCommand } from './commands/info.js';
import { registerInitCommand } from './commands/init.js';
import { registerConfigCommand } from './commands/config.js';
import { registerStatusCommand } from './commands/status.js';
import { registerProvidersCommand } from './commands/providers.js';
import { registerSearchCommand } from './commands/search.js';
import { registerInstallCommand } from './commands/install.js';
import { registerListCommand } from './commands/list.js';
import { registerUninstallCommand } from './commands/uninstall.js';

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

  // Enter interactive mode when no command is provided
  program.action(() => {
    startInteractiveMode();
  });

  // Register commands
  registerHelpCommand(program);
  registerVersionCommand(program);
  registerInfoCommand(program);
  registerInitCommand(program);
  registerConfigCommand(program);
  registerStatusCommand(program);
  registerProvidersCommand(program);
  registerSearchCommand(program);
  registerInstallCommand(program);
  registerListCommand(program);
  registerUninstallCommand(program);

  // TODO: Register more commands as they are implemented
  // These commands will work both via CLI (synapsync init)
  // and in interactive mode (/init)
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
      logger.error(`Error: ${error.message}`);
      logger.debug(error.stack ?? '');
    }
    process.exit(1);
  }
}
