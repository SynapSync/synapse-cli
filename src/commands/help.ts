/**
 * Help command
 */

import type { Command } from 'commander';
import pc from 'picocolors';
import { logger } from '../utils/logger.js';

export function registerHelpCommand(program: Command): void {
  program
    .command('help [command]')
    .description('Display help for a command')
    .action((commandName?: string) => {
      if (commandName) {
        const cmd = program.commands.find((c) => c.name() === commandName);
        if (cmd) {
          cmd.outputHelp();
        } else {
          logger.error(`Unknown command: ${commandName}`);
          logger.line();
          logger.log(`Run ${pc.cyan('synapsync --help')} to see available commands.`);
        }
      } else {
        program.outputHelp();
      }
    });
}
