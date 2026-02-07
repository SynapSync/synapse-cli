/**
 * REPL event loop - readline interface
 */

import * as readline from 'readline';
import pc from 'picocolors';
import { showBanner, showInfo } from '../banner.js';
import { CLI_NAME } from '../../core/constants.js';
import { logger } from '../../utils/logger.js';
import { executeCommand } from './dispatcher.js';

export function startInteractiveMode(): void {
  showBanner();

  logger.log(
    `${pc.dim('Type')} ${pc.cyan('/help')} ${pc.dim('for commands,')} ${pc.cyan('/exit')} ${pc.dim('to quit.')}`
  );
  logger.line();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: `${pc.green(CLI_NAME)} ${pc.dim('>')} `,
    terminal: true,
  });

  rl.on('line', (line) => {
    void executeCommand(line).then(() => {
      rl.prompt();
    });
  });

  rl.on('close', () => {
    logger.line();
    showInfo('Goodbye!');
    process.exit(0);
  });

  rl.on('SIGINT', () => {
    logger.line();
    logger.hint('(Use /exit to quit or Ctrl+D)');
    rl.prompt();
  });

  rl.prompt();
}
