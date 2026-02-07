/**
 * Doctor Service
 *
 * Diagnoses and fixes common issues with SynapSync projects
 */

import * as fs from 'fs';
import * as path from 'path';
import type { DiagnosticCheck, DiagnosticResult, FixResult, DoctorOptions } from './types.js';
import type { ProjectConfig } from '../config/schema.js';
import { ManifestManager } from '../manifest/manager.js';
import { CognitiveScanner } from '../scanner/scanner.js';
import { SymlinkManager } from '../symlink/manager.js';
import { RegistryClient } from '../registry/client.js';
import { COGNITIVE_TYPES } from '../../core/constants.js';
import type { SupportedProvider } from '../../core/constants.js';

export class DoctorService {
  private projectRoot: string;
  private synapSyncDir: string;
  private config: ProjectConfig | null;

  constructor(projectRoot: string, synapSyncDir: string, config?: ProjectConfig) {
    this.projectRoot = projectRoot;
    this.synapSyncDir = synapSyncDir;
    this.config = config ?? null;
  }

  /**
   * Run all diagnostic checks
   */
  async diagnose(options: DoctorOptions = {}): Promise<DiagnosticResult> {
    const startTime = Date.now();
    const checks: DiagnosticCheck[] = [];

    // Run all checks
    checks.push(this.checkNodeVersion());
    checks.push(this.checkSynapSyncDir());
    checks.push(this.checkConfig());
    checks.push(this.checkManifest());
    checks.push(this.checkManifestConsistency());
    checks.push(...this.checkProviders());
    checks.push(...this.checkSymlinks());
    checks.push(await this.checkRegistryConnectivity());

    // Filter by requested checks
    let filteredChecks = checks;
    if (options.checks !== undefined && options.checks.length > 0) {
      const requestedChecks = options.checks;
      filteredChecks = checks.filter((c) => requestedChecks.includes(c.id));
    }

    const result: DiagnosticResult = {
      checks: filteredChecks,
      passed: filteredChecks.filter((c) => c.status === 'pass').length,
      warnings: filteredChecks.filter((c) => c.status === 'warn').length,
      failed: filteredChecks.filter((c) => c.status === 'fail').length,
      skipped: filteredChecks.filter((c) => c.status === 'skip').length,
      healthy: filteredChecks.every((c) => c.status === 'pass' || c.status === 'skip'),
      duration: Date.now() - startTime,
    };

    return result;
  }

  /**
   * Fix detected issues
   */
  async fix(options: DoctorOptions = {}): Promise<FixResult> {
    const startTime = Date.now();
    const result: FixResult = {
      success: true,
      fixed: [],
      failed: [],
      duration: 0,
    };

    // Run diagnose first to find issues
    const diagnosis = await this.diagnose(options);

    // Fix each fixable failed check
    for (const check of diagnosis.checks) {
      if (check.status === 'fail' && check.fixable) {
        try {
          this.fixCheck(check);
          result.fixed.push(check.id);
        } catch (error) {
          result.failed.push({
            check: check.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          result.success = false;
        }
      }
    }

    result.duration = Date.now() - startTime;
    return result;
  }

  // ============================================
  // Individual Checks
  // ============================================

  private checkNodeVersion(): DiagnosticCheck {
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0] ?? '0', 10);

    if (majorVersion >= 20) {
      return {
        id: 'node-version',
        name: 'Node.js Version',
        description: 'Check if Node.js version is 20 or higher',
        status: 'pass',
        message: `Node.js ${nodeVersion} is installed`,
        fixable: false,
      };
    }

    return {
      id: 'node-version',
      name: 'Node.js Version',
      description: 'Check if Node.js version is 20 or higher',
      status: 'fail',
      message: `Node.js ${nodeVersion} is too old. Please upgrade to v20 or higher.`,
      fixable: false,
    };
  }

  private checkSynapSyncDir(): DiagnosticCheck {
    if (fs.existsSync(this.synapSyncDir)) {
      return {
        id: 'synapsync-dir',
        name: '.synapsync Directory',
        description: 'Check if .synapsync directory exists',
        status: 'pass',
        message: '.synapsync directory exists',
        fixable: true,
      };
    }

    return {
      id: 'synapsync-dir',
      name: '.synapsync Directory',
      description: 'Check if .synapsync directory exists',
      status: 'fail',
      message: '.synapsync directory not found',
      fixable: true,
    };
  }

  private checkConfig(): DiagnosticCheck {
    const configPath = path.join(this.projectRoot, 'synapsync.config.yaml');

    if (fs.existsSync(configPath)) {
      if (this.config !== null) {
        return {
          id: 'config-valid',
          name: 'Configuration',
          description: 'Check if synapsync.config.yaml is valid',
          status: 'pass',
          message: 'Configuration is valid',
          fixable: false,
        };
      }

      return {
        id: 'config-valid',
        name: 'Configuration',
        description: 'Check if synapsync.config.yaml is valid',
        status: 'fail',
        message: 'Configuration file exists but is invalid',
        fixable: false,
      };
    }

    return {
      id: 'config-valid',
      name: 'Configuration',
      description: 'Check if synapsync.config.yaml is valid',
      status: 'fail',
      message: 'Configuration file not found',
      fixable: false,
    };
  }

  private checkManifest(): DiagnosticCheck {
    const manifestPath = path.join(this.synapSyncDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      return {
        id: 'manifest-exists',
        name: 'Manifest File',
        description: 'Check if manifest.json exists',
        status: 'warn',
        message: 'manifest.json not found (will be created on first sync)',
        fixable: true,
      };
    }

    try {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      JSON.parse(content);

      return {
        id: 'manifest-exists',
        name: 'Manifest File',
        description: 'Check if manifest.json exists and is valid',
        status: 'pass',
        message: 'manifest.json is valid',
        fixable: true,
      };
    } catch {
      return {
        id: 'manifest-exists',
        name: 'Manifest File',
        description: 'Check if manifest.json exists and is valid',
        status: 'fail',
        message: 'manifest.json is corrupted',
        fixable: true,
      };
    }
  }

  private checkManifestConsistency(): DiagnosticCheck {
    if (!fs.existsSync(this.synapSyncDir)) {
      return {
        id: 'manifest-consistency',
        name: 'Manifest Consistency',
        description: 'Check if manifest matches filesystem',
        status: 'skip',
        message: 'Skipped - .synapsync directory not found',
        fixable: true,
      };
    }

    try {
      const scanner = new CognitiveScanner(this.synapSyncDir);
      const manifest = new ManifestManager(this.synapSyncDir);

      const scanned = scanner.scan();
      const comparison = scanner.compare(scanned, manifest.getCognitives());

      const issues: string[] = [];

      if (comparison.new.length > 0) {
        issues.push(`${comparison.new.length} new cognitive(s) not in manifest`);
      }
      if (comparison.removed.length > 0) {
        issues.push(`${comparison.removed.length} cognitive(s) in manifest but not in filesystem`);
      }
      if (comparison.modified.length > 0) {
        issues.push(`${comparison.modified.length} modified cognitive(s)`);
      }

      if (issues.length === 0) {
        return {
          id: 'manifest-consistency',
          name: 'Manifest Consistency',
          description: 'Check if manifest matches filesystem',
          status: 'pass',
          message: 'Manifest is consistent with filesystem',
          fixable: true,
        };
      }

      return {
        id: 'manifest-consistency',
        name: 'Manifest Consistency',
        description: 'Check if manifest matches filesystem',
        status: 'warn',
        message: 'Manifest is out of sync',
        fixable: true,
        details: issues,
      };
    } catch (error) {
      return {
        id: 'manifest-consistency',
        name: 'Manifest Consistency',
        description: 'Check if manifest matches filesystem',
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error',
        fixable: true,
      };
    }
  }

  private checkProviders(): DiagnosticCheck[] {
    const checks: DiagnosticCheck[] = [];

    if (this.config === null) {
      return [
        {
          id: 'providers-configured',
          name: 'Providers',
          description: 'Check if providers are configured',
          status: 'skip',
          message: 'Skipped - no configuration',
          fixable: false,
        },
      ];
    }

    const providers = this.config.sync?.providers ?? {};
    const enabledProviders = Object.entries(providers)
      .filter(([, cfg]) => (cfg as { enabled?: boolean }).enabled === true)
      .map(([name]) => name as SupportedProvider);

    if (enabledProviders.length === 0) {
      return [
        {
          id: 'providers-configured',
          name: 'Providers',
          description: 'Check if any providers are enabled',
          status: 'warn',
          message: 'No providers are enabled',
          fixable: false,
        },
      ];
    }

    checks.push({
      id: 'providers-configured',
      name: 'Providers',
      description: 'Check if providers are configured',
      status: 'pass',
      message: `${enabledProviders.length} provider(s) enabled: ${enabledProviders.join(', ')}`,
      fixable: false,
    });

    return checks;
  }

  private checkSymlinks(): DiagnosticCheck[] {
    const checks: DiagnosticCheck[] = [];

    if (this.config === null) {
      return checks;
    }

    const providers = this.config.sync?.providers ?? {};
    const enabledProviders = Object.entries(providers)
      .filter(([, cfg]) => (cfg as { enabled?: boolean }).enabled === true)
      .map(([name]) => name as SupportedProvider);

    const symlink = new SymlinkManager(this.projectRoot, this.synapSyncDir);

    for (const provider of enabledProviders) {
      const { valid, broken, orphaned } = symlink.verifyProvider(provider);
      const total = valid.length + broken.length + orphaned.length;

      if (total === 0) {
        checks.push({
          id: `symlinks-${provider}`,
          name: `${provider} Symlinks`,
          description: `Check symlinks for ${provider}`,
          status: 'pass',
          message: 'No symlinks configured yet',
          fixable: false,
        });
        continue;
      }

      if (broken.length === 0 && orphaned.length === 0) {
        checks.push({
          id: `symlinks-${provider}`,
          name: `${provider} Symlinks`,
          description: `Check symlinks for ${provider}`,
          status: 'pass',
          message: `${valid.length} valid symlink(s)`,
          fixable: true,
        });
      } else {
        const details: string[] = [];
        if (broken.length > 0) details.push(`${broken.length} broken`);
        if (orphaned.length > 0) details.push(`${orphaned.length} orphaned`);

        checks.push({
          id: `symlinks-${provider}`,
          name: `${provider} Symlinks`,
          description: `Check symlinks for ${provider}`,
          status: 'warn',
          message: `${valid.length} valid, ${details.join(', ')}`,
          fixable: true,
          details: [
            ...broken.map((l) => `Broken: ${l.cognitiveName}`),
            ...orphaned.map((l) => `Orphaned: ${l.cognitiveName}`),
          ],
        });
      }
    }

    return checks;
  }

  private async checkRegistryConnectivity(): Promise<DiagnosticCheck> {
    try {
      const registry = new RegistryClient();
      const reachable = await registry.ping();

      if (reachable) {
        return {
          id: 'registry-connectivity',
          name: 'Registry Connectivity',
          description: 'Check connection to SynapSync registry',
          status: 'pass',
          message: 'Registry is reachable',
          fixable: false,
        };
      }

      return {
        id: 'registry-connectivity',
        name: 'Registry Connectivity',
        description: 'Check connection to SynapSync registry',
        status: 'warn',
        message: 'Registry is not reachable (check internet connection)',
        fixable: false,
      };
    } catch {
      return {
        id: 'registry-connectivity',
        name: 'Registry Connectivity',
        description: 'Check connection to SynapSync registry',
        status: 'warn',
        message: 'Failed to check registry connectivity',
        fixable: false,
      };
    }
  }

  // ============================================
  // Fix Methods
  // ============================================

  private fixCheck(check: DiagnosticCheck): void {
    switch (check.id) {
      case 'synapsync-dir':
        this.fixSynapSyncDir();
        break;

      case 'manifest-exists':
      case 'manifest-consistency':
        this.fixManifest();
        break;

      default:
        if (check.id.startsWith('symlinks-')) {
          const provider = check.id.replace('symlinks-', '') as SupportedProvider;
          this.fixSymlinks(provider);
        }
    }
  }

  private fixSynapSyncDir(): void {
    if (!fs.existsSync(this.synapSyncDir)) {
      fs.mkdirSync(this.synapSyncDir, { recursive: true });
    }

    // Create type directories
    for (const type of COGNITIVE_TYPES) {
      const typeDir = path.join(this.synapSyncDir, `${type}s`);
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
      }
    }
  }

  private fixManifest(): void {
    // Ensure directory exists
    this.fixSynapSyncDir();

    // Regenerate manifest from filesystem
    const scanner = new CognitiveScanner(this.synapSyncDir);
    const manifest = new ManifestManager(this.synapSyncDir);

    const scanned = scanner.scan();
    const manifestCognitives = scanned.map((s) => scanner.toManifestCognitive(s));
    const result = manifest.reconcile(manifestCognitives);

    manifest.applyReconciliation(result);
    manifest.save();
  }

  private fixSymlinks(provider: SupportedProvider): void {
    const symlink = new SymlinkManager(this.projectRoot, this.synapSyncDir);
    symlink.cleanProvider(provider);
  }

  /**
   * Get list of available check IDs
   */
  static getAvailableChecks(): string[] {
    return [
      'node-version',
      'synapsync-dir',
      'config-valid',
      'manifest-exists',
      'manifest-consistency',
      'providers-configured',
      'registry-connectivity',
      // Provider-specific symlink checks are dynamic
    ];
  }
}
