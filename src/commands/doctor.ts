/**
 * Doctor Command
 *
 * Diagnose and fix issues with SynapSync projects
 */

import type { Command } from 'commander';
import pc from 'picocolors';
import { ConfigManager } from '../services/config/manager.js';
import { DoctorService } from '../services/maintenance/doctor.js';
import type { DiagnosticCheck, DiagnosticResult, FixResult } from '../services/maintenance/types.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface DoctorCommandOptions {
  fix?: boolean;
  check?: string[];
  verbose?: boolean;
  json?: boolean;
}

// ============================================
// Main Function
// ============================================

/**
 * Execute the doctor command
 */
export async function executeDoctorCommand(options: DoctorCommandOptions = {}): Promise<void> {
  logger.line();

  // Check if project is initialized
  const configManager = ConfigManager.findConfig();
  if (configManager === null) {
    logger.error('No SynapSync project found.');
    logger.hint('Run synapsync init to initialize a project first.');
    return;
  }

  const synapSyncDir = configManager.getSynapSyncDir();
  const projectRoot = configManager.getProjectRoot();

  let config;
  try {
    config = configManager.getConfig();
  } catch {
    config = undefined;
  }

  const doctor = new DoctorService(projectRoot, synapSyncDir, config);

  // Header
  if (options.json !== true) {
    if (options.fix === true) {
      logger.bold('  Running Diagnostics & Fixes');
    } else {
      logger.bold('  Running Diagnostics');
    }
    logger.line();
  }

  // Run diagnostics
  const result = await doctor.diagnose({
    checks: options.check,
    verbose: options.verbose,
  });

  // If fix mode, apply fixes
  let fixResult: FixResult | undefined;
  if (options.fix === true && result.failed > 0) {
    fixResult = await doctor.fix({
      checks: options.check,
      verbose: options.verbose,
    });
  }

  // JSON output
  if (options.json === true) {
    console.log(
      JSON.stringify(
        {
          diagnostics: result,
          fixes: fixResult,
        },
        null,
        2
      )
    );
    return;
  }

  // Display results
  displayDiagnostics(result, options.verbose);

  if (fixResult !== undefined) {
    logger.line();
    displayFixes(fixResult);
  }

  // Summary
  logger.line();
  if (result.healthy) {
    logger.log(`  ${pc.green('✓')} Your project is healthy!`);
  } else if (result.failed > 0) {
    logger.log(`  ${pc.red('!')} ${result.failed} issue(s) found`);
    if (options.fix !== true) {
      logger.hint('Run synapsync doctor --fix to auto-repair fixable issues.');
    }
  } else if (result.warnings > 0) {
    logger.log(`  ${pc.yellow('!')} ${result.warnings} warning(s)`);
  }

  logger.line();
  logger.log(`  ${pc.dim(`Checked ${result.checks.length} items in ${result.duration}ms`)}`);
  logger.line();
}

// ============================================
// Display Functions
// ============================================

function displayDiagnostics(result: DiagnosticResult, verbose = false): void {
  for (const check of result.checks) {
    displayCheck(check, verbose);
  }
}

function displayCheck(check: DiagnosticCheck, verbose = false): void {
  const statusIcon = getStatusIcon(check.status);
  const statusColor = getStatusColor(check.status);

  logger.log(`  ${statusIcon} ${statusColor(check.name)}`);

  if (verbose || check.status === 'fail' || check.status === 'warn') {
    logger.log(`      ${pc.dim(check.message)}`);

    if (check.details !== undefined && check.details.length > 0) {
      for (const detail of check.details) {
        logger.log(`      ${pc.dim('•')} ${pc.dim(detail)}`);
      }
    }
  }
}

function displayFixes(result: FixResult): void {
  logger.bold('  Fixes Applied:');
  logger.line();

  if (result.fixed.length > 0) {
    for (const fix of result.fixed) {
      logger.log(`    ${pc.green('✓')} Fixed: ${fix}`);
    }
  }

  if (result.failed.length > 0) {
    for (const fail of result.failed) {
      logger.log(`    ${pc.red('✗')} Failed: ${fail.check} - ${fail.error}`);
    }
  }

  if (result.fixed.length === 0 && result.failed.length === 0) {
    logger.log(`    ${pc.dim('No fixes needed')}`);
  }
}

function getStatusIcon(status: DiagnosticCheck['status']): string {
  switch (status) {
    case 'pass':
      return pc.green('✓');
    case 'warn':
      return pc.yellow('!');
    case 'fail':
      return pc.red('✗');
    case 'skip':
      return pc.dim('○');
  }
}

function getStatusColor(status: DiagnosticCheck['status']): (text: string) => string {
  switch (status) {
    case 'pass':
      return pc.green;
    case 'warn':
      return pc.yellow;
    case 'fail':
      return pc.red;
    case 'skip':
      return pc.dim;
  }
}

// ============================================
// Command Registration
// ============================================

/**
 * Register doctor command with Commander
 */
export function registerDoctorCommand(program: Command): void {
  program
    .command('doctor')
    .description('Diagnose and fix issues with your SynapSync project')
    .option('-f, --fix', 'Auto-fix detected issues')
    .option('-c, --check <checks...>', 'Run specific checks only')
    .option('-v, --verbose', 'Show detailed output')
    .option('--json', 'Output as JSON')
    .action(async (options: DoctorCommandOptions) => {
      await executeDoctorCommand(options);
    });
}
