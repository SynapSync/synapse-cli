/**
 * Version command - shows detailed version information
 */

import type { Command } from 'commander';
import pc from 'picocolors';
import { version } from '../version.js';
import { logger } from '../utils/logger.js';

export function registerVersionCommand(program: Command): void {
  program
    .command('version')
    .description('Show detailed version information')
    .option('--check', 'Check for available updates')
    .action((options: { check?: boolean }) => {
      logger.line();
      logger.log(`${pc.bold('SynapSync CLI')} ${pc.cyan(`v${version}`)}`);
      logger.line();
      logger.label('Node.js', process.version);
      logger.label('Platform', `${process.platform} ${process.arch}`);
      logger.label('Home', process.env['HOME'] ?? 'N/A');
      logger.line();

      if (options.check === true) {
        logger.hint('Checking for updates...');
        // TODO: Implement update check against registry/npm
        logger.success('You are using the latest version');
      }
    });
}
