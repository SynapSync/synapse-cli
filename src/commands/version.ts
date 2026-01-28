/**
 * Version command - shows detailed version information
 */

import type { Command } from 'commander';
import pc from 'picocolors';
import { version } from '../version.js';
import { logger } from '../utils/logger.js';

// Package name for npm registry lookup
const PACKAGE_NAME = 'synapsync';

/**
 * Compare two semver version strings
 * Returns: -1 if a < b, 0 if a === b, 1 if a > b
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const partA = partsA[i] ?? 0;
    const partB = partsB[i] ?? 0;

    if (partA < partB) return -1;
    if (partA > partB) return 1;
  }

  return 0;
}

/**
 * Fetch latest version from npm registry
 */
async function fetchLatestVersion(): Promise<string | null> {
  try {
    // Create abort controller with timeout (globalThis for Node.js compatibility)
    const controller = new globalThis.AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://registry.npmjs.org/${PACKAGE_NAME}/latest`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { version?: string };
    return data.version ?? null;
  } catch {
    return null;
  }
}

/**
 * Check for available updates
 */
async function checkForUpdates(): Promise<void> {
  logger.hint('Checking for updates...');

  const latestVersion = await fetchLatestVersion();

  if (latestVersion === null) {
    logger.warning('Could not check for updates. Package may not be published yet.');
    return;
  }

  const comparison = compareVersions(version, latestVersion);

  if (comparison < 0) {
    // Current version is older
    logger.line();
    logger.warning(`Update available: ${pc.cyan(`v${version}`)} → ${pc.green(`v${latestVersion}`)}`);
    logger.line();
    logger.log(`  Run ${pc.cyan('npm install -g synapsync')} to update`);
  } else if (comparison > 0) {
    // Current version is newer (development version)
    logger.info(`You are running a development version (${pc.cyan(`v${version}`)})`);
    logger.log(`  Latest published: ${pc.dim(`v${latestVersion}`)}`);
  } else {
    // Versions are equal
    logger.success('You are using the latest version');
  }
}

export function registerVersionCommand(program: Command): void {
  program
    .command('version')
    .description('Show detailed version information')
    .option('--check', 'Check for available updates')
    .action(async (options: { check?: boolean }) => {
      logger.line();
      logger.log(`${pc.bold('SynapSync CLI')} ${pc.cyan(`v${version}`)}`);
      logger.line();
      logger.label('Node.js', process.version);
      logger.label('Platform', `${process.platform} ${process.arch}`);
      logger.label('Home', process.env['HOME'] ?? 'N/A');
      logger.line();

      if (options.check === true) {
        await checkForUpdates();
      }
    });
}
