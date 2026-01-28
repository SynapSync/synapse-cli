/**
 * Core constants for SynapSync CLI
 */

// Storage paths (configurable via env or config file)
export const DEFAULT_AGENTS_DIR = process.env['SYNAPSYNC_AGENTS_DIR'] ?? '.agents';
export const DEFAULT_SKILLS_SUBDIR = process.env['SYNAPSYNC_SKILLS_SUBDIR'] ?? 'skills';
export const SKILL_FILE_NAME = 'SKILL.md';
export const MANIFEST_FILE_NAME = 'skills.manifest.json';
export const CONFIG_FILE_NAME = 'synapsync.config.yaml';

// Departments for skill organization
export const DEPARTMENTS = [
  'frontend',
  'backend',
  'database',
  'devops',
  'security',
  'growth',
  'testing',
  'general',
] as const;

export type Department = (typeof DEPARTMENTS)[number] | string;

// Provider configuration
export const PROVIDER_PATHS: Record<string, string> = {
  claude: '.claude/skills',
  gemini: '.gemini/skills',
  codex: '.codex/skills',
  cursor: '.cursor/skills',
  windsurf: '.windsurf/skills',
};

export const SUPPORTED_PROVIDERS = ['claude', 'openai', 'gemini', 'huggingface'] as const;
export type SupportedProvider = (typeof SUPPORTED_PROVIDERS)[number];

// CLI metadata
export const CLI_NAME = 'synapsync';
export const CLI_DESCRIPTION = 'Neural AI Orchestration Platform - Manage AI skills across providers';

// ANSI escape codes for terminal
export const RESET = '\x1b[0m';
export const DIM = '\x1b[2m';
export const BOLD = '\x1b[1m';
