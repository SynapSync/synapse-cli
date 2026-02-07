/**
 * Help system for the interactive REPL
 */

import pc from 'picocolors';
import { showError } from '../banner.js';
import { logger } from '../../utils/logger.js';
import { COMMANDS, registerInteractiveCommand } from './registry.js';

export function showCommandHelp(commandName: string): void {
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

registerInteractiveCommand(
  'help',
  'Show available commands or help for a specific command',
  (args) => {
    const commandName = args.trim().toLowerCase().replace(/^\//, '');

    if (commandName) {
      showCommandHelp(commandName);
      return;
    }

    logger.line();
    logger.bold('  Available Commands:');
    logger.line();

    logger.log(`  ${pc.cyan('/help [command]')}    ${pc.dim('Show help (or help for a command)')}`);
    logger.log(`  ${pc.cyan('/clear')}             ${pc.dim('Clear the screen')}`);
    logger.log(`  ${pc.cyan('/exit')}              ${pc.dim('Exit interactive mode')}`);
    logger.line();

    const categories: Record<string, string[]> = {
      Information: ['info', 'version'],
      Project: ['init', 'config', 'status'],
      Providers: ['providers'],
      Cognitives: ['add', 'list', 'uninstall'],
      Sync: ['sync'],
      Maintenance: ['update', 'doctor', 'clean', 'purge'],
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
    examples: ['/help', '/help info', '/help add'],
  }
);
