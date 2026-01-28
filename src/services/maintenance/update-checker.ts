/**
 * Update Checker Service
 *
 * Checks for available updates to installed cognitives
 */

import type { UpdateInfo, UpdateCheckResult, UpdateError } from './types.js';
import type { ManifestCognitive } from '../manifest/types.js';
import { RegistryClient } from '../registry/client.js';

export class UpdateChecker {
  private registry: RegistryClient;

  constructor(registry?: RegistryClient) {
    this.registry = registry ?? new RegistryClient();
  }

  /**
   * Check all installed cognitives for updates
   */
  async checkAll(installed: ManifestCognitive[]): Promise<UpdateCheckResult> {
    const result: UpdateCheckResult = {
      checked: 0,
      updatesAvailable: [],
      upToDate: [],
      errors: [],
      checkTime: new Date().toISOString(),
    };

    // Only check registry-sourced cognitives
    const registryCognitives = installed.filter((c) => c.source === 'registry');

    for (const cognitive of registryCognitives) {
      try {
        const updateInfo = await this.checkOne(cognitive);
        result.checked++;

        if (updateInfo.hasUpdate) {
          result.updatesAvailable.push(updateInfo);
        } else {
          result.upToDate.push(updateInfo);
        }
      } catch (error) {
        result.errors.push({
          cognitive: cognitive.name,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return result;
  }

  /**
   * Check a single cognitive for updates
   */
  async checkOne(cognitive: ManifestCognitive): Promise<UpdateInfo> {
    const entry = await this.registry.findByName(cognitive.name);

    if (entry === null) {
      // Cognitive not in registry anymore
      return {
        name: cognitive.name,
        type: cognitive.type,
        category: cognitive.category,
        currentVersion: cognitive.version,
        latestVersion: cognitive.version,
        hasUpdate: false,
        source: cognitive.source,
      };
    }

    const hasUpdate = this.compareVersions(cognitive.version, entry.version) < 0;

    return {
      name: cognitive.name,
      type: cognitive.type,
      category: cognitive.category,
      currentVersion: cognitive.version,
      latestVersion: entry.version,
      hasUpdate,
      source: cognitive.source,
    };
  }

  /**
   * Compare two semver versions
   * Returns: -1 if a < b, 0 if a == b, 1 if a > b
   */
  private compareVersions(a: string, b: string): number {
    const parseVersion = (v: string): number[] => {
      return v
        .replace(/^v/, '')
        .split('.')
        .map((n) => parseInt(n, 10) || 0);
    };

    const aParts = parseVersion(a);
    const bParts = parseVersion(b);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aNum = aParts[i] ?? 0;
      const bNum = bParts[i] ?? 0;

      if (aNum < bNum) return -1;
      if (aNum > bNum) return 1;
    }

    return 0;
  }

  /**
   * Get the registry client
   */
  getRegistry(): RegistryClient {
    return this.registry;
  }
}
