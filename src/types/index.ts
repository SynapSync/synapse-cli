/**
 * Core types for SynapSync CLI
 */

import type { Department, SupportedProvider } from '../core/constants.js';

// ============================================
// Skill Types
// ============================================

export interface SkillMetadata {
  name: string;
  version: string;
  department: Department;
  description: string;
  author?: string;
  tags?: string[];
  providers?: string[];
}

export interface Skill extends SkillMetadata {
  content: string;
  path: string;
}

export interface InstalledSkill {
  name: string;
  department: Department;
  version: string;
  installedAt: Date;
  source: 'registry' | 'local' | 'git';
  sourceUrl?: string;
}

// ============================================
// Manifest Types
// ============================================

export interface SkillManifest {
  version: string;
  lastUpdated: string;
  skills: Record<string, InstalledSkill>;
  syncs: Record<
    string,
    {
      lastSync: string;
      method: 'symlink' | 'copy';
      skills: string[];
    }
  >;
}

// ============================================
// Provider Types
// ============================================

export interface ProviderConnection {
  id: string;
  name: SupportedProvider;
  status: 'active' | 'inactive' | 'error';
  config: {
    model: string;
    maxTokens?: number;
    temperature?: number;
  };
  lastSync?: Date;
  createdAt: Date;
}

export interface ProviderHealthStatus {
  healthy: boolean;
  latency?: number;
  error?: string;
}

// ============================================
// Config Types
// ============================================

export interface SyncConfig {
  agentsDir: string;
  skillsSubdir: string;
  defaultMethod: 'symlink' | 'copy';
  providers: Record<
    string,
    {
      enabled: boolean;
      path: string;
    }
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
    agentsDir: string;
    skillsSubdir: string;
  };
  sync: SyncConfig;
  providers: Record<string, ProviderConnection>;
}

// ============================================
// Command Types
// ============================================

export interface CommandContext {
  cwd: string;
  config?: ProjectConfig;
  verbose: boolean;
}

// Re-export Department type
export type { Department, SupportedProvider };
