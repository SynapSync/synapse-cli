/**
 * Core constants for SynapSync CLI
 */

// ============================================
// Cognitive Types - The types of AI cognitives managed
// Cognitives are the building blocks of AI capabilities:
// skills, agents, prompts, workflows, and tools
// ============================================
export const COGNITIVE_TYPES = ['skill', 'agent', 'prompt', 'workflow', 'tool'] as const;
export type CognitiveType = (typeof COGNITIVE_TYPES)[number];

// File extensions per cognitive type (used for detection/scanning)
export const COGNITIVE_FILE_EXTENSIONS: Record<CognitiveType, string> = {
  skill: '.md',
  agent: '.md',
  prompt: '.md',
  workflow: '.yaml',
  tool: '.md',
};

// Sync mode per cognitive type:
// - 'folder': Sync entire folder (for cognitives with assets, like skills)
// - 'file': Sync as flat file (for simple cognitives like agents)
export const COGNITIVE_SYNC_MODE: Record<CognitiveType, 'folder' | 'file'> = {
  skill: 'folder', // Skills have SKILL.md + assets/ folder
  agent: 'file', // Agents are single .md files
  prompt: 'file', // Prompts are single .md files
  workflow: 'file', // Workflows are single .yaml files
  tool: 'file', // Tools are single .md files
};

// Legacy: Default file names per cognitive type (for backward compatibility)
// New cognitives should use their original filename
export const COGNITIVE_FILE_NAMES: Record<CognitiveType, string> = {
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
export const AGENTS_MD_FILE_NAME = 'AGENTS.md';

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
  'integrations',
  'planning',
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

// Provider paths for syncing cognitives
export const PROVIDER_PATHS: Record<SupportedProvider, Record<CognitiveType, string>> = {
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
  'Neural AI Orchestration Platform - Manage AI cognitives (skills, agents, prompts, tools) across providers';

// ============================================
// Registry Configuration
// ============================================
export const REGISTRY_BASE_URL =
  process.env['SYNAPSYNC_REGISTRY_URL'] ??
  'https://raw.githubusercontent.com/SynapSync/synapse-registry/main';
export const REGISTRY_INDEX_FILE = 'registry.json';
export const REGISTRY_MANIFEST_FILE = 'manifest.json';

// ============================================
// ANSI Escape Codes
// ============================================
export const RESET = '\x1b[0m';
export const DIM = '\x1b[2m';
export const BOLD = '\x1b[1m';
