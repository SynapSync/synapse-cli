/**
 * Configuration Manager
 *
 * Handles reading, writing, and manipulating synapsync.config.yaml
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';
import { CONFIG_FILE_NAME, DEFAULT_SYNAPSYNC_DIR } from '../../core/constants.js';
import {
  type ProjectConfig,
  createDefaultConfig,
  validateConfig,
  getNestedValue,
  setNestedValue,
  type ValidationError,
} from './schema.js';

// ============================================
// ConfigManager Class
// ============================================

export class ConfigManager {
  private config: ProjectConfig | null = null;
  private configPath: string;
  private projectRoot: string;

  constructor(projectRoot?: string) {
    this.projectRoot = projectRoot ?? process.cwd();
    this.configPath = path.join(this.projectRoot, CONFIG_FILE_NAME);
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Find and load config from current directory or parents
   */
  static findConfig(startDir?: string): ConfigManager | null {
    let dir = startDir ?? process.cwd();

    while (dir !== path.dirname(dir)) {
      const configPath = path.join(dir, CONFIG_FILE_NAME);
      if (fs.existsSync(configPath)) {
        const manager = new ConfigManager(dir);
        manager.load();
        return manager;
      }
      dir = path.dirname(dir);
    }

    return null;
  }

  /**
   * Check if a project is initialized in the given directory
   */
  static isProjectInitialized(dir?: string): boolean {
    const projectRoot = dir ?? process.cwd();
    const configPath = path.join(projectRoot, CONFIG_FILE_NAME);
    const synapSyncDir = path.join(projectRoot, DEFAULT_SYNAPSYNC_DIR);

    return fs.existsSync(configPath) && fs.existsSync(synapSyncDir);
  }

  // ============================================
  // Core Methods
  // ============================================

  /**
   * Check if config file exists
   */
  exists(): boolean {
    return fs.existsSync(this.configPath);
  }

  /**
   * Load configuration from file
   */
  load(): ProjectConfig {
    if (!this.exists()) {
      throw new Error(`Configuration file not found: ${this.configPath}`);
    }

    const content = fs.readFileSync(this.configPath, 'utf-8');
    const parsed = yaml.parse(content) as unknown;

    // Validate
    const errors = validateConfig(parsed);
    if (errors.length > 0) {
      throw new ConfigValidationError(errors);
    }

    this.config = parsed as ProjectConfig;
    return this.config;
  }

  /**
   * Save configuration to file
   */
  save(): void {
    if (this.config === null) {
      throw new Error('No configuration to save. Call load() or create() first.');
    }

    const content = yaml.stringify(this.config, {
      indent: 2,
      lineWidth: 100,
    });

    fs.writeFileSync(this.configPath, content, 'utf-8');
  }

  /**
   * Create a new configuration
   */
  create(name: string, description?: string): ProjectConfig {
    this.config = createDefaultConfig(name, description);
    return this.config;
  }

  /**
   * Get the current configuration
   */
  getConfig(): ProjectConfig {
    if (this.config === null) {
      throw new Error('No configuration loaded. Call load() or create() first.');
    }
    return this.config;
  }

  /**
   * Get project root directory
   */
  getProjectRoot(): string {
    return this.projectRoot;
  }

  /**
   * Get synapsync directory path
   */
  getSynapSyncDir(): string {
    const dir = this.config?.storage?.dir ?? DEFAULT_SYNAPSYNC_DIR;
    return path.isAbsolute(dir) ? dir : path.join(this.projectRoot, dir);
  }

  // ============================================
  // Value Access Methods
  // ============================================

  /**
   * Get a configuration value by dot-notation path
   * Example: get('cli.theme') -> 'auto'
   */
  get(keyPath: string): unknown {
    if (this.config === null) {
      throw new Error('No configuration loaded. Call load() or create() first.');
    }
    return getNestedValue(this.config as unknown as Record<string, unknown>, keyPath);
  }

  /**
   * Set a configuration value by dot-notation path
   * Example: set('cli.theme', 'dark')
   */
  set(keyPath: string, value: unknown): void {
    if (this.config === null) {
      throw new Error('No configuration loaded. Call load() or create() first.');
    }
    setNestedValue(this.config as unknown as Record<string, unknown>, keyPath, value);
  }

  /**
   * Check if a configuration key exists
   */
  has(keyPath: string): boolean {
    return this.get(keyPath) !== undefined;
  }

  /**
   * Get all configuration as a flat object with dot-notation keys
   */
  flatten(): Record<string, unknown> {
    if (this.config === null) {
      throw new Error('No configuration loaded. Call load() or create() first.');
    }

    const result: Record<string, unknown> = {};

    function flattenObject(obj: Record<string, unknown>, prefix = ''): void {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix !== '' ? `${prefix}.${key}` : key;

        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          flattenObject(value as Record<string, unknown>, fullKey);
        } else {
          result[fullKey] = value;
        }
      }
    }

    flattenObject(this.config as unknown as Record<string, unknown>);
    return result;
  }
}

// ============================================
// Custom Errors
// ============================================

export class ConfigValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    const messages = errors.map((e) => `  - ${e.path}: ${e.message}`).join('\n');
    super(`Configuration validation failed:\n${messages}`);
    this.name = 'ConfigValidationError';
  }
}

export class ConfigNotFoundError extends Error {
  constructor(searchPath: string) {
    super(`No synapsync.config.yaml found in ${searchPath} or parent directories`);
    this.name = 'ConfigNotFoundError';
  }
}
