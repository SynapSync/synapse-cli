/**
 * Core types for SynapSync CLI
 */

import type { AssetType, Category, SupportedProvider } from '../core/constants.js';

// ============================================
// Base Asset Types
// ============================================

/**
 * Base metadata shared by all asset types
 */
export interface AssetMetadata {
  name: string;
  type: AssetType;
  version: string;
  category: Category;
  description: string;
  author?: string;
  tags?: string[];
  providers?: SupportedProvider[];
}

/**
 * A complete asset with content and location
 */
export interface Asset extends AssetMetadata {
  content: string;
  path: string;
}

/**
 * Record of an installed asset
 */
export interface InstalledAsset {
  name: string;
  type: AssetType;
  category: Category;
  version: string;
  installedAt: Date;
  source: 'registry' | 'local' | 'git';
  sourceUrl?: string;
}

// ============================================
// Specialized Asset Types
// ============================================

/**
 * Skill - Reusable instruction sets for AI assistants
 */
export interface Skill extends Asset {
  type: 'skill';
}

/**
 * Agent - Autonomous AI entities with specific behaviors
 */
export interface Agent extends Asset {
  type: 'agent';
  capabilities?: string[];
  systemPrompt?: string;
}

/**
 * Prompt - Reusable prompt templates
 */
export interface Prompt extends Asset {
  type: 'prompt';
  variables?: string[];
  examples?: string[];
}

/**
 * Workflow - Multi-step AI processes
 */
export interface Workflow extends Asset {
  type: 'workflow';
  steps?: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'prompt' | 'agent' | 'tool' | 'condition';
  config: Record<string, unknown>;
}

/**
 * Tool - External integrations and functions
 */
export interface Tool extends Asset {
  type: 'tool';
  schema?: Record<string, unknown>;
  endpoint?: string;
}

// ============================================
// Manifest Types
// ============================================

export interface SynapSyncManifest {
  version: string;
  lastUpdated: string;
  assets: Record<string, InstalledAsset>;
  syncs: Record<
    SupportedProvider,
    {
      lastSync: string;
      method: 'symlink' | 'copy';
      assets: string[];
    }
  >;
}

// ============================================
// Provider Types
// ============================================

export interface ProviderConnection {
  id: string;
  name: SupportedProvider;
  status: 'connected' | 'disconnected' | 'error';
  config: ProviderConfig;
  lastSync?: Date;
  createdAt: Date;
}

export interface ProviderConfig {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  apiKeyEnvVar?: string;
}

export interface ProviderHealthStatus {
  healthy: boolean;
  latency?: number;
  error?: string;
}

// ============================================
// Configuration Types
// ============================================

export interface SyncConfig {
  defaultMethod: 'symlink' | 'copy';
  providers: Partial<
    Record<
      SupportedProvider,
      {
        enabled: boolean;
        paths?: Partial<Record<AssetType, string>>;
      }
    >
  >;
}

export interface CLIConfig {
  theme: 'auto' | 'light' | 'dark';
  color: boolean;
  verbose: boolean;
}

export interface ProjectConfig {
  name: string;
  version: string;
  cli: CLIConfig;
  storage: {
    dir: string;
  };
  sync: SyncConfig;
  providers: Partial<Record<SupportedProvider, ProviderConnection>>;
}

// ============================================
// Command Types
// ============================================

export interface CommandContext {
  cwd: string;
  config?: ProjectConfig;
  verbose: boolean;
}

// ============================================
// Registry Types
// ============================================

export interface RegistryAsset {
  name: string;
  type: AssetType;
  version: string;
  description: string;
  author: string;
  downloads: number;
  stars: number;
  lastUpdated: string;
}

export interface RegistrySearchResult {
  assets: RegistryAsset[];
  total: number;
  page: number;
  perPage: number;
}

// ============================================
// Re-exports
// ============================================
export type { AssetType, Category, SupportedProvider };
