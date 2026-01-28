/**
 * Config Command
 *
 * Manage SynapSync project configuration
 */

import type { Command } from 'commander';
import pc from 'picocolors';
import { ConfigManager } from '../services/config/manager.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

type ConfigAction = 'list' | 'get' | 'set';

interface ConfigOptions {
  action: ConfigAction;
  key?: string;
  value?: string;
}

// ============================================
// Main Functions
// ============================================

/**
 * Execute the config command
 */
export function executeConfigCommand(args: string): void {
  const options = parseConfigArgs(args);

  // Find config file
  const configManager = ConfigManager.findConfig();

  if (configManager === null) {
    logger.line();
    logger.error('No SynapSync project found.');
    logger.hint('Run /init to initialize a project.');
    return;
  }

  switch (options.action) {
    case 'list':
      showConfigList(configManager);
      break;
    case 'get':
      showConfigValue(configManager, options.key ?? '');
      break;
    case 'set':
      setConfigValue(configManager, options.key ?? '', options.value ?? '');
      break;
  }
}

// ============================================
// Config Actions
// ============================================

/**
 * Show all configuration values
 */
function showConfigList(configManager: ConfigManager): void {
  const flatConfig = configManager.flatten();

  logger.line();
  logger.bold('  Configuration');
  logger.line();

  // Group by top-level key
  const groups: Record<string, Record<string, unknown>> = {};

  for (const [key, value] of Object.entries(flatConfig)) {
    const parts = key.split('.');
    const group = parts[0] ?? 'other';

    groups[group] ??= {};
    groups[group][key] = value;
  }

  // Display each group
  for (const [group, values] of Object.entries(groups)) {
    logger.log(`  ${pc.cyan(group)}:`);

    for (const [key, value] of Object.entries(values)) {
      const displayKey = key.replace(`${group}.`, '');
      const displayValue = formatValue(value);
      logger.log(`    ${pc.dim(displayKey.padEnd(30))} ${displayValue}`);
    }

    logger.line();
  }

  logger.hint(`Config file: ${configManager.getProjectRoot()}/synapsync.config.yaml`);
}

/**
 * Show a specific configuration value
 */
function showConfigValue(configManager: ConfigManager, key: string): void {
  if (key === '') {
    logger.line();
    logger.error('Key is required.');
    logger.hint('Usage: /config get <key>');
    logger.hint('Example: /config get cli.theme');
    return;
  }

  const value = configManager.get(key);

  logger.line();

  if (value === undefined) {
    logger.warning(`Key not found: ${pc.cyan(key)}`);
    logger.line();
    logger.hint('Use /config list to see all available keys.');
  } else {
    logger.log(`  ${pc.cyan(key)} = ${formatValue(value)}`);
  }
}

/**
 * Set a configuration value
 */
function setConfigValue(configManager: ConfigManager, key: string, value: string): void {
  if (key === '') {
    logger.line();
    logger.error('Key is required.');
    logger.hint('Usage: /config set <key> <value>');
    logger.hint('Example: /config set cli.theme dark');
    return;
  }

  if (value === '') {
    logger.line();
    logger.error('Value is required.');
    logger.hint('Usage: /config set <key> <value>');
    return;
  }

  // Check if key exists (warning for new keys)
  const existingValue = configManager.get(key);
  const isNewKey = existingValue === undefined;

  // Parse value (handle booleans and numbers)
  const parsedValue = parseValue(value);

  // Set the value
  configManager.set(key, parsedValue);
  configManager.save();

  logger.line();

  if (isNewKey) {
    logger.warning(`Created new key: ${pc.cyan(key)}`);
  }

  logger.success(`${pc.cyan(key)} = ${formatValue(parsedValue)}`);
}

// ============================================
// Argument Parsing
// ============================================

function parseConfigArgs(args: string): ConfigOptions {
  const parts = args.trim().split(/\s+/);
  const action = (parts[0] ?? 'list').toLowerCase();

  // Default to list if no action
  if (action === '' || action === 'list') {
    return { action: 'list' };
  }

  if (action === 'get') {
    return {
      action: 'get',
      key: parts[1],
    };
  }

  if (action === 'set') {
    return {
      action: 'set',
      key: parts[1],
      value: parts.slice(2).join(' '),
    };
  }

  // Treat unknown action as a key (shorthand for get)
  return {
    action: 'get',
    key: action,
  };
}

// ============================================
// Value Formatting
// ============================================

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return pc.dim('(not set)');
  }

  if (typeof value === 'boolean') {
    return value ? pc.green('true') : pc.red('false');
  }

  if (typeof value === 'number') {
    return pc.yellow(String(value));
  }

  if (typeof value === 'string') {
    return pc.white(`"${value}"`);
  }

  if (Array.isArray(value)) {
    return pc.dim(`[${value.join(', ')}]`);
  }

  return pc.dim(JSON.stringify(value));
}

function parseValue(value: string): unknown {
  // Boolean
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;

  // Number
  const num = Number(value);
  if (!isNaN(num) && value.trim() !== '') return num;

  // String
  return value;
}

// ============================================
// Command Registration
// ============================================

/**
 * Register config command with Commander
 */
export function registerConfigCommand(program: Command): void {
  const configCmd = program
    .command('config')
    .description('Manage project configuration');

  configCmd
    .command('list')
    .description('Show all configuration values')
    .action(() => {
      executeConfigCommand('list');
    });

  configCmd
    .command('get <key>')
    .description('Get a configuration value')
    .action((key: string) => {
      executeConfigCommand(`get ${key}`);
    });

  configCmd
    .command('set <key> <value>')
    .description('Set a configuration value')
    .action((key: string, value: string) => {
      executeConfigCommand(`set ${key} ${value}`);
    });

  // Default action (no subcommand)
  configCmd.action(() => {
    executeConfigCommand('list');
  });
}
