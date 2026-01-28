/**
 * Welcome banner for SynapSync CLI
 */

import pc from 'picocolors';
import { showLogo } from './logo.js';
import { version } from '../version.js';
import { logger } from '../utils/logger.js';

/**
 * Show the full welcome banner
 */
export function showBanner(): void {
  showLogo();
  logger.line();
  logger.dim(`Neural AI Orchestration Platform`);
  logger.dim(`Version ${version}`);
  logger.line();

  // Quick start commands
  logger.bold('  Quick Start:');
  logger.line();
  logger.command('synapsync init', 'Initialize a new project');
  logger.command('synapsync connect', 'Connect to AI providers');
  logger.command('synapsync search', 'Search for skills');
  logger.command('synapsync install <skill>', 'Install a skill');
  logger.command('synapsync sync', 'Sync skills to providers');
  logger.line();

  // Help hint
  logger.log(`  ${pc.dim('Run')} ${pc.cyan('synapsync --help')} ${pc.dim('for all commands')}`);
  logger.line();
}

/**
 * Show a minimal header (for command output)
 */
export function showHeader(title: string): void {
  logger.header(title);
}

/**
 * Show success message
 */
export function showSuccess(message: string): void {
  logger.success(message);
}

/**
 * Show error message
 */
export function showError(message: string): void {
  logger.error(message);
}

/**
 * Show warning message
 */
export function showWarning(message: string): void {
  logger.warning(message);
}

/**
 * Show info message
 */
export function showInfo(message: string): void {
  logger.info(message);
}
