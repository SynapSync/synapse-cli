/**
 * Configuration Service
 *
 * Handles all configuration-related operations for SynapSync
 */

// Schema and types
export {
  type CLIConfig,
  type StorageConfig,
  type ProviderSyncConfig,
  type SyncConfig,
  type ProjectConfig,
  type ValidationError,
  DEFAULT_CLI_CONFIG,
  DEFAULT_STORAGE_CONFIG,
  DEFAULT_SYNC_CONFIG,
  createDefaultConfig,
  validateConfig,
  getNestedValue,
  setNestedValue,
} from './schema.js';

// Manager
export { ConfigManager, ConfigValidationError, ConfigNotFoundError } from './manager.js';
