/**
 * Command dispatcher - parses input and routes to handlers
 */

import pc from 'picocolors';
import { showError } from '../banner.js';
import { logger } from '../../utils/logger.js';
import { COMMANDS } from './registry.js';

export async function executeCommand(input: string): Promise<void> {
  const trimmed = input.trim();

  if (!trimmed) {
    return;
  }

  if (!trimmed.startsWith('/')) {
    showError(`Unknown input. Commands must start with /`);
    logger.log(`${pc.dim('Type')} ${pc.cyan('/help')} ${pc.dim('for available commands.')}`);
    return;
  }

  const parts = trimmed.slice(1).split(/\s+/);
  const commandName = parts[0]?.toLowerCase();
  const args = parts.slice(1).join(' ');

  if (!commandName) {
    return;
  }

  const command = COMMANDS[commandName];

  if (!command) {
    showError(`Unknown command: /${commandName}`);
    logger.log(`${pc.dim('Type')} ${pc.cyan('/help')} ${pc.dim('for available commands.')}`);
    return;
  }

  try {
    await command.handler(args);
  } catch (error) {
    if (error instanceof Error) {
      showError(error.message);
    } else {
      showError('An unexpected error occurred');
    }
  }
}
