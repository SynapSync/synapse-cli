/**
 * Providers Command
 *
 * Manage provider configuration for SynapSync
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Command } from 'commander';
import pc from 'picocolors';
import { ConfigManager } from '../services/config/manager.js';
import { SUPPORTED_PROVIDERS, PROVIDER_PATHS } from '../core/constants.js';
import type { SupportedProvider } from '../core/constants.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface ProviderInfo {
  name: SupportedProvider;
  enabled: boolean;
  path: string;
  exists: boolean;
}

// ============================================
// Main Functions
// ============================================

/**
 * Execute the providers command
 */
export function executeProvidersCommand(args: string): void {
  const parts = args.trim().split(/\s+/);
  const subcommand = parts[0]?.toLowerCase() ?? '';

  // Find config
  const configManager = ConfigManager.findConfig();

  if (configManager === null) {
    logger.line();
    logger.error('No SynapSync project found.');
    logger.hint('Run /init to initialize a project.');
    return;
  }

  switch (subcommand) {
    case '':
    case 'list':
      listProviders(configManager);
      break;
    case 'enable':
      enableProvider(configManager, parts[1]);
      break;
    case 'disable':
      disableProvider(configManager, parts[1]);
      break;
    case 'path':
      setProviderPath(configManager, parts[1], parts[2]);
      break;
    default:
      // Check if it's a provider name (shortcut for info)
      if (SUPPORTED_PROVIDERS.includes(subcommand as SupportedProvider)) {
        showProviderInfo(configManager, subcommand as SupportedProvider);
      } else {
        logger.line();
        logger.error(`Unknown subcommand: ${subcommand}`);
        logger.hint('Usage: /providers [list|enable|disable|path]');
      }
  }
}

// ============================================
// Provider Actions
// ============================================

/**
 * List all providers and their status
 */
function listProviders(configManager: ConfigManager): void {
  const providers = getProvidersInfo(configManager);

  logger.line();
  logger.bold('  Providers');
  logger.line();

  // Table header
  logger.log(
    `  ${pc.dim('Provider'.padEnd(12))} ${pc.dim('Status'.padEnd(10))} ${pc.dim('Path'.padEnd(20))} ${pc.dim('Directory')}`
  );
  logger.log(`  ${pc.dim('─'.repeat(60))}`);

  // Provider rows
  for (const provider of providers) {
    const statusIcon = provider.enabled ? pc.green('●') : pc.dim('○');
    const statusText = provider.enabled ? pc.green('enabled') : pc.dim('disabled');
    const pathText = pc.cyan(provider.path);
    const existsText = provider.exists ? pc.green('✓ exists') : pc.dim('✗ missing');

    logger.log(
      `  ${statusIcon} ${pc.white(provider.name.padEnd(10))} ${statusText.padEnd(19)} ${pathText.padEnd(29)} ${existsText}`
    );
  }

  logger.line();

  // Summary
  const enabledCount = providers.filter((p) => p.enabled).length;
  logger.log(`  ${pc.dim('Enabled:')} ${enabledCount} of ${providers.length} providers`);
  logger.line();

  logger.hint('Use /providers enable <name> or /providers disable <name>');
}

/**
 * Enable a provider
 */
function enableProvider(configManager: ConfigManager, providerName: string | undefined): void {
  if (providerName === undefined || providerName === '') {
    logger.line();
    logger.error('Provider name is required.');
    logger.hint('Usage: /providers enable <provider>');
    logger.hint(`Available: ${SUPPORTED_PROVIDERS.join(', ')}`);
    return;
  }

  const provider = providerName.toLowerCase();

  if (!SUPPORTED_PROVIDERS.includes(provider as SupportedProvider)) {
    logger.line();
    logger.error(`Unknown provider: ${provider}`);
    logger.hint(`Available: ${SUPPORTED_PROVIDERS.join(', ')}`);
    return;
  }

  // Check if already enabled
  const currentValue = configManager.get(`sync.providers.${provider}.enabled`);
  if (currentValue === true) {
    logger.line();
    logger.info(`Provider '${provider}' is already enabled.`);
    return;
  }

  // Enable the provider
  configManager.set(`sync.providers.${provider}.enabled`, true);

  // Set default paths if not set
  const defaultPaths = PROVIDER_PATHS[provider as SupportedProvider];
  const currentPaths = configManager.get(`sync.providers.${provider}.paths`);
  if (currentPaths === undefined) {
    configManager.set(`sync.providers.${provider}.paths`, defaultPaths);
  }

  configManager.save();

  logger.line();
  logger.success(`Provider '${pc.cyan(provider)}' enabled`);
  logger.log(`  ${pc.dim('Path:')} ${defaultPaths.skill.split('/')[0]}/`);
  logger.line();
  logger.hint('Run /sync to synchronize cognitives to this provider.');
}

/**
 * Disable a provider
 */
function disableProvider(configManager: ConfigManager, providerName: string | undefined): void {
  if (providerName === undefined || providerName === '') {
    logger.line();
    logger.error('Provider name is required.');
    logger.hint('Usage: /providers disable <provider>');
    return;
  }

  const provider = providerName.toLowerCase();

  if (!SUPPORTED_PROVIDERS.includes(provider as SupportedProvider)) {
    logger.line();
    logger.error(`Unknown provider: ${provider}`);
    logger.hint(`Available: ${SUPPORTED_PROVIDERS.join(', ')}`);
    return;
  }

  // Check if already disabled
  const currentValue = configManager.get(`sync.providers.${provider}.enabled`);
  if (currentValue !== true) {
    logger.line();
    logger.info(`Provider '${provider}' is already disabled.`);
    return;
  }

  // Disable the provider
  configManager.set(`sync.providers.${provider}.enabled`, false);
  configManager.save();

  logger.line();
  logger.success(`Provider '${pc.cyan(provider)}' disabled`);
}

/**
 * Set custom path for a provider
 */
function setProviderPath(
  configManager: ConfigManager,
  providerName: string | undefined,
  newPath: string | undefined
): void {
  if (providerName === undefined || providerName === '') {
    logger.line();
    logger.error('Provider name is required.');
    logger.hint('Usage: /providers path <provider> <path>');
    return;
  }

  if (newPath === undefined || newPath === '') {
    logger.line();
    logger.error('Path is required.');
    logger.hint('Usage: /providers path <provider> <path>');
    logger.hint('Example: /providers path claude .claude-code/');
    return;
  }

  const provider = providerName.toLowerCase();

  if (!SUPPORTED_PROVIDERS.includes(provider as SupportedProvider)) {
    logger.line();
    logger.error(`Unknown provider: ${provider}`);
    logger.hint(`Available: ${SUPPORTED_PROVIDERS.join(', ')}`);
    return;
  }

  // Normalize path (ensure it ends with /)
  const normalizedPath = newPath.endsWith('/') ? newPath : `${newPath}/`;

  // Update all cognitive type paths
  const cognitiveTypes = ['skill', 'agent', 'prompt', 'workflow', 'tool'] as const;
  for (const type of cognitiveTypes) {
    configManager.set(`sync.providers.${provider}.paths.${type}`, `${normalizedPath}${type}s`);
  }

  configManager.save();

  logger.line();
  logger.success(`Updated paths for '${pc.cyan(provider)}'`);
  logger.log(`  ${pc.dim('Base path:')} ${pc.cyan(normalizedPath)}`);
  logger.line();
}

/**
 * Show detailed info for a specific provider
 */
function showProviderInfo(configManager: ConfigManager, provider: SupportedProvider): void {
  const config = configManager.getConfig();
  const projectRoot = configManager.getProjectRoot();
  const providerConfig = config.sync?.providers?.[provider];
  const enabled = providerConfig?.enabled ?? false;
  const paths = providerConfig?.paths ?? PROVIDER_PATHS[provider];

  logger.line();
  logger.bold(`  ${getProviderDisplayName(provider)}`);
  logger.line();

  // Status
  const statusIcon = enabled ? pc.green('●') : pc.dim('○');
  const statusText = enabled ? pc.green('Enabled') : pc.dim('Disabled');
  logger.log(`  ${pc.dim('Status:')}  ${statusIcon} ${statusText}`);
  logger.line();

  // Paths
  logger.log(`  ${pc.dim('Paths:')}`);
  const cognitiveTypes = ['skill', 'agent', 'prompt', 'workflow', 'tool'] as const;
  for (const type of cognitiveTypes) {
    const typePath = paths[type];
    const fullPath = path.join(projectRoot, typePath);
    const exists = fs.existsSync(fullPath);
    const existsIcon = exists ? pc.green('✓') : pc.dim('✗');
    logger.log(`    ${pc.dim(type.padEnd(10))} ${pc.cyan(typePath)} ${existsIcon}`);
  }

  logger.line();
}

// ============================================
// Helper Functions
// ============================================

function getProvidersInfo(configManager: ConfigManager): ProviderInfo[] {
  const config = configManager.getConfig();
  const projectRoot = configManager.getProjectRoot();
  const providers: ProviderInfo[] = [];

  for (const provider of SUPPORTED_PROVIDERS) {
    const providerConfig = config.sync?.providers?.[provider];
    const enabled = providerConfig?.enabled ?? false;
    const basePath = providerConfig?.paths?.skill?.split('/')[0] ?? `.${provider}`;
    const fullPath = path.join(projectRoot, basePath);
    const exists = fs.existsSync(fullPath);

    providers.push({
      name: provider,
      enabled,
      path: `${basePath}/`,
      exists,
    });
  }

  return providers;
}

function getProviderDisplayName(provider: SupportedProvider): string {
  const names: Record<SupportedProvider, string> = {
    claude: 'Claude (Anthropic)',
    openai: 'OpenAI (GPT)',
    gemini: 'Gemini (Google)',
    cursor: 'Cursor IDE',
    windsurf: 'Windsurf IDE',
    copilot: 'GitHub Copilot',
  };
  return names[provider];
}

// ============================================
// Command Registration
// ============================================

/**
 * Register providers command with Commander
 */
export function registerProvidersCommand(program: Command): void {
  const providersCmd = program
    .command('providers')
    .description('Manage provider configuration');

  // List (default)
  providersCmd
    .command('list', { isDefault: true })
    .description('List all providers and their status')
    .action(() => {
      executeProvidersCommand('list');
    });

  // Enable
  providersCmd
    .command('enable <provider>')
    .description('Enable a provider')
    .action((provider: string) => {
      executeProvidersCommand(`enable ${provider}`);
    });

  // Disable
  providersCmd
    .command('disable <provider>')
    .description('Disable a provider')
    .action((provider: string) => {
      executeProvidersCommand(`disable ${provider}`);
    });

  // Path
  providersCmd
    .command('path <provider> <path>')
    .description('Set custom sync path for a provider')
    .action((provider: string, newPath: string) => {
      executeProvidersCommand(`path ${provider} ${newPath}`);
    });

  // Default action
  providersCmd.action(() => {
    executeProvidersCommand('list');
  });
}
