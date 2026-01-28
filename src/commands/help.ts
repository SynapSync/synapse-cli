/**
 * Help command
 */

import type { Command } from 'commander';
import pc from 'picocolors';

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
          console.log(pc.red(`Unknown command: ${commandName}`));
          console.log();
          console.log(`Run ${pc.cyan('synapsync --help')} to see available commands.`);
        }
      } else {
        program.outputHelp();
      }
    });
}
