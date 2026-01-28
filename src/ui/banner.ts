/**
 * Welcome banner for SynapSync CLI
 */

import pc from 'picocolors';
import { showLogo } from './logo.js';
import { version } from '../version.js';
import { DIM, RESET } from '../core/constants.js';

/**
 * Show the full welcome banner
 */
export function showBanner(): void {
  showLogo();
  console.log();
  console.log(`${DIM}Neural AI Orchestration Platform${RESET}`);
  console.log(`${DIM}Version ${version}${RESET}`);
  console.log();

  // Quick start commands
  console.log(pc.bold('  Quick Start:'));
  console.log();
  console.log(`  ${pc.dim('$')} ${pc.white('synapsync init')}            ${pc.dim('Initialize a new project')}`);
  console.log(
    `  ${pc.dim('$')} ${pc.white('synapsync connect')}         ${pc.dim('Connect to AI providers')}`
  );
  console.log(`  ${pc.dim('$')} ${pc.white('synapsync search')}          ${pc.dim('Search for skills')}`);
  console.log(`  ${pc.dim('$')} ${pc.white('synapsync install <skill>')} ${pc.dim('Install a skill')}`);
  console.log(`  ${pc.dim('$')} ${pc.white('synapsync sync')}            ${pc.dim('Sync skills to providers')}`);
  console.log();

  // Help hint
  console.log(`  ${pc.dim('Run')} ${pc.cyan('synapsync --help')} ${pc.dim('for all commands')}`);
  console.log();
}

/**
 * Show a minimal header (for command output)
 */
export function showHeader(title: string): void {
  console.log();
  console.log(pc.bold(pc.cyan(`  ${title}`)));
  console.log(pc.dim('  ' + '─'.repeat(title.length + 2)));
  console.log();
}

/**
 * Show success message
 */
export function showSuccess(message: string): void {
  console.log(`${pc.green('✓')} ${message}`);
}

/**
 * Show error message
 */
export function showError(message: string): void {
  console.log(`${pc.red('✗')} ${message}`);
}

/**
 * Show warning message
 */
export function showWarning(message: string): void {
  console.log(`${pc.yellow('⚠')} ${message}`);
}

/**
 * Show info message
 */
export function showInfo(message: string): void {
  console.log(`${pc.blue('ℹ')} ${message}`);
}
