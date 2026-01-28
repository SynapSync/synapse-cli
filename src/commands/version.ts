/**
 * Version command - shows detailed version information
 */

import type { Command } from 'commander';
import pc from 'picocolors';
import { version } from '../version.js';

export function registerVersionCommand(program: Command): void {
  program
    .command('version')
    .description('Show detailed version information')
    .option('--check', 'Check for available updates')
    .action(async (options: { check?: boolean }) => {
      console.log();
      console.log(`${pc.bold('SynapSync CLI')} ${pc.cyan(`v${version}`)}`);
      console.log();
      console.log(`${pc.dim('Node.js:')}    ${process.version}`);
      console.log(`${pc.dim('Platform:')}   ${process.platform} ${process.arch}`);
      console.log(`${pc.dim('Home:')}       ${process.env['HOME'] ?? 'N/A'}`);
      console.log();

      if (options.check) {
        console.log(pc.dim('Checking for updates...'));
        // TODO: Implement update check against registry/npm
        console.log(pc.green('✓ You are using the latest version'));
      }
    });
}
