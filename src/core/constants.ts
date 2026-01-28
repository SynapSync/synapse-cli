/**
 * Core constants for SynapSync CLI
 */

// ============================================
// Asset Types - The types of AI resources managed
// ============================================
export const ASSET_TYPES = ['skill', 'agent', 'prompt', 'workflow', 'tool'] as const;
export type AssetType = (typeof ASSET_TYPES)[number];

// Default file names per asset type
export const ASSET_FILE_NAMES: Record<AssetType, string> = {
  skill: 'SKILL.md',
  agent: 'AGENT.md',
  prompt: 'PROMPT.md',
  workflow: 'WORKFLOW.yaml',
  tool: 'TOOL.md',
};

// ============================================
// Storage Paths
// ============================================
export const DEFAULT_SYNAPSYNC_DIR = process.env['SYNAPSYNC_DIR'] ?? '.synapsync';
export const MANIFEST_FILE_NAME = 'manifest.json';
export const CONFIG_FILE_NAME = 'synapsync.config.yaml';
export const LOCK_FILE_NAME = 'synapsync.lock';

// Legacy support (will be deprecated)
export const DEFAULT_AGENTS_DIR = process.env['SYNAPSYNC_AGENTS_DIR'] ?? '.agents';
export const DEFAULT_SKILLS_SUBDIR = process.env['SYNAPSYNC_SKILLS_SUBDIR'] ?? 'skills';

// ============================================
// Categories for resource organization
// ============================================
export const CATEGORIES = [
  'frontend',
  'backend',
  'database',
  'devops',
  'security',
  'testing',
  'analytics',
  'automation',
  'general',
] as const;

export type Category = (typeof CATEGORIES)[number] | string;

// ============================================
// Provider Configuration
// ============================================
export const SUPPORTED_PROVIDERS = [
  'claude',
  'openai',
  'gemini',
  'cursor',
  'windsurf',
  'copilot',
] as const;
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

// Provider paths for syncing assets
export const PROVIDER_PATHS: Record<SupportedProvider, Record<AssetType, string>> = {
  claude: {
    skill: '.claude/skills',
    agent: '.claude/agents',
    prompt: '.claude/prompts',
    workflow: '.claude/workflows',
    tool: '.claude/tools',
  },
  openai: {
    skill: '.openai/skills',
    agent: '.openai/agents',
    prompt: '.openai/prompts',
    workflow: '.openai/workflows',
    tool: '.openai/tools',
  },
  gemini: {
    skill: '.gemini/skills',
    agent: '.gemini/agents',
    prompt: '.gemini/prompts',
    workflow: '.gemini/workflows',
    tool: '.gemini/tools',
  },
  cursor: {
    skill: '.cursor/skills',
    agent: '.cursor/agents',
    prompt: '.cursor/prompts',
    workflow: '.cursor/workflows',
    tool: '.cursor/tools',
  },
  windsurf: {
    skill: '.windsurf/skills',
    agent: '.windsurf/agents',
    prompt: '.windsurf/prompts',
    workflow: '.windsurf/workflows',
    tool: '.windsurf/tools',
  },
  copilot: {
    skill: '.github/skills',
    agent: '.github/agents',
    prompt: '.github/prompts',
    workflow: '.github/workflows',
    tool: '.github/tools',
  },
};

// ============================================
// CLI Metadata
// ============================================
export const CLI_NAME = 'synapsync';
export const CLI_DESCRIPTION =
  'Neural AI Orchestration Platform - Manage AI skills, agents, prompts and tools across providers';

// ============================================
// ANSI Escape Codes
// ============================================
export const RESET = '\x1b[0m';
export const DIM = '\x1b[2m';
export const BOLD = '\x1b[1m';
