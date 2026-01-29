/**
 * Configuration Schema and Defaults
 */

import type { CognitiveType, SupportedProvider } from '../../core/constants.js';
import { SUPPORTED_PROVIDERS, PROVIDER_PATHS, DEFAULT_SYNAPSYNC_DIR } from '../../core/constants.js';

// ============================================
// Configuration Types
// ============================================

export interface CLIConfig {
  theme: 'auto' | 'light' | 'dark';
  color: boolean;
  verbose: boolean;
}

export interface StorageConfig {
  dir: string;
}

export interface ProviderSyncConfig {
  enabled: boolean;
  paths?: Partial<Record<CognitiveType, string>>;
}

export interface SyncConfig {
  method: 'symlink' | 'copy';
  providers: Partial<Record<SupportedProvider, ProviderSyncConfig>>;
}

export interface ProjectConfig {
  name: string;
  description?: string;
  version: string;
  cli: CLIConfig;
  storage: StorageConfig;
  sync: SyncConfig;
}

// ============================================
// Default Configuration
// ============================================

export const DEFAULT_CLI_CONFIG: CLIConfig = {
  theme: 'auto',
  color: true,
  verbose: false,
};

export const DEFAULT_STORAGE_CONFIG: StorageConfig = {
  dir: DEFAULT_SYNAPSYNC_DIR,
};

export const DEFAULT_SYNC_CONFIG: SyncConfig = {
  method: 'symlink',
  providers: {
    claude: {
      enabled: true,
      paths: PROVIDER_PATHS.claude,
    },
    openai: {
      enabled: false,
      paths: PROVIDER_PATHS.openai,
    },
    cursor: {
      enabled: false,
      paths: PROVIDER_PATHS.cursor,
    },
  },
};

export function createDefaultConfig(name: string, description?: string): ProjectConfig {
  const config: ProjectConfig = {
    name,
    version: '1.0.0',
    cli: { ...DEFAULT_CLI_CONFIG },
    storage: { ...DEFAULT_STORAGE_CONFIG },
    sync: {
      method: DEFAULT_SYNC_CONFIG.method,
      providers: JSON.parse(JSON.stringify(DEFAULT_SYNC_CONFIG.providers)) as SyncConfig['providers'],
    },
  };
  if (description !== undefined) {
    config.description = description;
  }
  return config;
}

// ============================================
// Validation
// ============================================

export interface ValidationError {
  path: string;
  message: string;
}

export function validateConfig(config: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (typeof config !== 'object' || config === null) {
    errors.push({ path: '', message: 'Configuration must be an object' });
    return errors;
  }

  const cfg = config as Record<string, unknown>;

  // Required fields
  if (typeof cfg['name'] !== 'string' || cfg['name'].trim() === '') {
    errors.push({ path: 'name', message: 'Project name is required' });
  }

  // CLI config validation
  if (cfg['cli'] !== undefined) {
    if (typeof cfg['cli'] !== 'object' || cfg['cli'] === null) {
      errors.push({ path: 'cli', message: 'cli must be an object' });
    } else {
      const cli = cfg['cli'] as Record<string, unknown>;
      if (cli['theme'] !== undefined && !['auto', 'light', 'dark'].includes(cli['theme'] as string)) {
        errors.push({ path: 'cli.theme', message: 'theme must be auto, light, or dark' });
      }
    }
  }

  // Sync config validation
  if (cfg['sync'] !== undefined) {
    if (typeof cfg['sync'] !== 'object' || cfg['sync'] === null) {
      errors.push({ path: 'sync', message: 'sync must be an object' });
    } else {
      const sync = cfg['sync'] as Record<string, unknown>;
      if (sync['method'] !== undefined && !['symlink', 'copy'].includes(sync['method'] as string)) {
        errors.push({ path: 'sync.method', message: 'method must be symlink or copy' });
      }

      // Validate providers
      if (sync['providers'] !== undefined) {
        if (typeof sync['providers'] !== 'object' || sync['providers'] === null) {
          errors.push({ path: 'sync.providers', message: 'providers must be an object' });
        } else {
          const providers = sync['providers'] as Record<string, unknown>;
          for (const [key, value] of Object.entries(providers)) {
            if (!SUPPORTED_PROVIDERS.includes(key as SupportedProvider)) {
              errors.push({
                path: `sync.providers.${key}`,
                message: `Unknown provider: ${key}. Supported: ${SUPPORTED_PROVIDERS.join(', ')}`,
              });
            }
            if (typeof value !== 'object' || value === null) {
              errors.push({ path: `sync.providers.${key}`, message: 'Provider config must be an object' });
            }
          }
        }
      }
    }
  }

  return errors;
}

// ============================================
// Path Utilities
// ============================================

/**
 * Get a nested value from config using dot notation
 * Example: getNestedValue(config, 'cli.theme') -> 'auto'
 */
export function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    if (typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Set a nested value in config using dot notation
 * Example: setNestedValue(config, 'cli.theme', 'dark')
 */
export function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.split('.');
  let current: Record<string, unknown> = obj;

  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (part === undefined) continue;

    if (current[part] === undefined || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }

  const lastPart = parts[parts.length - 1];
  if (lastPart !== undefined) {
    current[lastPart] = value;
  }
}
