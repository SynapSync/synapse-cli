/**
 * Info command - Documentation and help about SynapSync concepts
 */

import type { Command } from 'commander';
import pc from 'picocolors';
import { logger } from '../utils/logger.js';

// ============================================
// Info Topics
// ============================================

interface InfoTopic {
  name: string;
  description: string;
  content: () => void;
}

const INFO_TOPICS: Record<string, InfoTopic> = {
  cognitives: {
    name: 'Cognitives',
    description: 'Types of AI cognitives managed by SynapSync',
    content: showCognitivesInfo,
  },
  add: {
    name: 'Add',
    description: 'How to add cognitives from different sources',
    content: showAddInfo,
  },
  providers: {
    name: 'Providers',
    description: 'Supported AI providers',
    content: showProvidersInfo,
  },
  categories: {
    name: 'Categories',
    description: 'Cognitive organization categories',
    content: showCategoriesInfo,
  },
  sync: {
    name: 'Sync',
    description: 'How synchronization works',
    content: showSyncInfo,
  },
  structure: {
    name: 'Structure',
    description: 'Project directory structure',
    content: showStructureInfo,
  },
};

// ============================================
// Topic Content Functions
// ============================================

function showCognitivesInfo(): void {
  logger.line();
  logger.log(pc.bold(pc.cyan('  Cognitive Types')));
  logger.line();
  logger.dim(
    '  SynapSync manages multiple types of AI cognitives that can be installed,'
  );
  logger.dim('  synced across providers, and shared via the registry.');
  logger.line();

  // Cognitives table
  const cognitives = [
    {
      type: 'skill',
      file: 'SKILL.md',
      description: 'Reusable instruction sets for AI assistants',
      color: pc.blue,
    },
    {
      type: 'agent',
      file: 'AGENT.md',
      description: 'Autonomous AI entities with specific behaviors',
      color: pc.yellow,
    },
    {
      type: 'prompt',
      file: 'PROMPT.md',
      description: 'Reusable prompt templates with variables',
      color: pc.magenta,
    },
    {
      type: 'workflow',
      file: 'WORKFLOW.yaml',
      description: 'Multi-step processes combining agents and prompts',
      color: pc.green,
    },
    {
      type: 'tool',
      file: 'TOOL.md',
      description: 'External integrations and functions',
      color: pc.cyan,
    },
  ];

  // Header
  logger.log(
    `  ${pc.dim('Type')}        ${pc.dim('File')}             ${pc.dim('Description')}`
  );
  logger.log(pc.dim('  ' + '─'.repeat(70)));

  // Rows
  for (const cognitive of cognitives) {
    const typeCol = cognitive.color(cognitive.type.padEnd(10));
    const fileCol = pc.white(cognitive.file.padEnd(16));
    const descCol = pc.dim(cognitive.description);
    logger.log(`  ${typeCol}  ${fileCol} ${descCol}`);
  }

  logger.line();

  // Usage examples
  logger.log(pc.bold('  Usage Examples:'));
  logger.line();
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync add')} code-reviewer      ${pc.dim('# Add a skill')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync add')} ci-agent           ${pc.dim('# Add an agent')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync list')} --type agent          ${pc.dim('# List only agents')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync sync')} --type skill          ${pc.dim('# Sync only skills')}`);
  logger.line();

  // Storage hint
  logger.log(pc.bold('  Storage:'));
  logger.line();
  logger.dim('  Cognitives are stored in .synapsync/{type}s/{category}/{name}/');
  logger.dim('  Example: .synapsync/skills/frontend/react-patterns/SKILL.md');
  logger.line();

  // Detection
  logger.log(pc.bold('  Type Detection:'));
  logger.line();
  logger.dim('  When adding, SynapSync detects the cognitive type automatically:');
  logger.line();
  logger.log(`  ${pc.cyan('1.')} ${pc.white('Flag')}       ${pc.dim('--type skill (explicit, highest priority)')}`);
  logger.log(`  ${pc.cyan('2.')} ${pc.white('Registry')}   ${pc.dim('Metadata from the registry')}`);
  logger.log(`  ${pc.cyan('3.')} ${pc.white('File')}       ${pc.dim('Detects SKILL.md, AGENT.md, etc.')}`);
  logger.log(`  ${pc.cyan('4.')} ${pc.white('Prompt')}     ${pc.dim('Asks you if cannot detect')}`);
  logger.line();
}

function showAddInfo(): void {
  logger.line();
  logger.log(pc.bold(pc.cyan('  Installation Sources')));
  logger.line();
  logger.dim('  SynapSync can add cognitives from multiple sources:');
  logger.line();

  // Sources table
  logger.log(pc.bold('  Supported Sources:'));
  logger.line();

  const sources = [
    {
      source: 'Registry',
      format: 'synapsync add code-reviewer',
      description: 'From the SynapSync registry',
    },
    {
      source: 'Local',
      format: 'synapsync add ./path/to/cognitive',
      description: 'From local file system',
    },
    {
      source: 'GitHub',
      format: 'synapsync add github:user/repo',
      description: 'From a GitHub repository',
    },
    {
      source: 'GitHub Path',
      format: 'synapsync add github:user/repo/cognitives/skill',
      description: 'Specific path in repo',
    },
    {
      source: 'GitHub Branch',
      format: 'synapsync add github:user/repo#develop',
      description: 'Specific branch or tag',
    },
    {
      source: 'GitHub URL',
      format: 'synapsync add https://github.com/user/repo',
      description: 'Full GitHub URL',
    },
  ];

  for (const src of sources) {
    logger.log(`  ${pc.green(src.source.padEnd(14))} ${pc.dim(src.description)}`);
    logger.log(`  ${' '.repeat(14)} ${pc.cyan(src.format)}`);
    logger.line();
  }

  // Type detection
  logger.log(pc.bold('  Type Detection:'));
  logger.line();
  logger.dim('  SynapSync automatically detects the cognitive type using:');
  logger.line();

  logger.log(`  ${pc.cyan('1.')} ${pc.white('Explicit flag')}     ${pc.dim('synapsync add code-reviewer --type skill')}`);
  logger.log(`  ${pc.cyan('2.')} ${pc.white('Registry lookup')}   ${pc.dim('Registry provides type metadata')}`);
  logger.log(`  ${pc.cyan('3.')} ${pc.white('File detection')}    ${pc.dim('Scans for SKILL.md, AGENT.md, etc.')}`);
  logger.log(`  ${pc.cyan('4.')} ${pc.white('Interactive')}       ${pc.dim('Prompts you to select if unknown')}`);
  logger.line();

  // Version
  logger.log(pc.bold('  Version Specification:'));
  logger.line();
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync add')} code-reviewer          ${pc.dim('# Latest version')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync add')} code-reviewer@1.2.0    ${pc.dim('# Specific version')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync add')} code-reviewer@^1.0.0   ${pc.dim('# Version range')}`);
  logger.line();

  // Options
  logger.log(pc.bold('  Common Options:'));
  logger.line();
  logger.log(`  ${pc.yellow('--type <type>')}       ${pc.dim('Explicit cognitive type (skill, agent, prompt, workflow, tool)')}`);
  logger.log(`  ${pc.yellow('--category <cat>')}    ${pc.dim('Explicit category (frontend, backend, etc.)')}`);
  logger.log(`  ${pc.yellow('--force')}             ${pc.dim('Force reinstall even if exists')}`);
  logger.line();
}

function showProvidersInfo(): void {
  logger.line();
  logger.log(pc.bold(pc.cyan('  Supported Providers')));
  logger.line();
  logger.dim('  SynapSync can sync your cognitives to multiple AI providers.');
  logger.dim('  Each provider has its own directory structure for cognitives.');
  logger.line();

  const providers = [
    { name: 'claude', vendor: 'Anthropic', path: '.claude/', color: pc.yellow },
    { name: 'openai', vendor: 'OpenAI', path: '.openai/', color: pc.green },
    { name: 'gemini', vendor: 'Google', path: '.gemini/', color: pc.blue },
    { name: 'cursor', vendor: 'Cursor IDE', path: '.cursor/', color: pc.magenta },
    { name: 'windsurf', vendor: 'Codeium', path: '.windsurf/', color: pc.cyan },
    { name: 'copilot', vendor: 'GitHub', path: '.github/', color: pc.white },
  ];

  // Header
  logger.log(`  ${pc.dim('Provider')}    ${pc.dim('Vendor')}       ${pc.dim('Path')}`);
  logger.log(pc.dim('  ' + '─'.repeat(45)));

  // Rows
  for (const provider of providers) {
    const nameCol = provider.color(provider.name.padEnd(11));
    const vendorCol = pc.white(provider.vendor.padEnd(12));
    const pathCol = pc.dim(provider.path);
    logger.log(`  ${nameCol} ${vendorCol} ${pathCol}`);
  }

  logger.line();

  // Usage
  logger.log(pc.bold('  Usage:'));
  logger.line();
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync connect')} claude     ${pc.dim('# Connect to Claude')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync providers')}           ${pc.dim('# List connected providers')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync sync')} --provider claude  ${pc.dim('# Sync to specific provider')}`);
  logger.line();
}

function showCategoriesInfo(): void {
  logger.line();
  logger.log(pc.bold(pc.cyan('  Cognitive Categories')));
  logger.line();
  logger.dim('  Cognitives are organized by category for better management.');
  logger.dim('  Categories help group related cognitives together.');
  logger.line();

  const categories = [
    { name: 'frontend', description: 'UI, components, styling, React, Vue, etc.', color: pc.yellow },
    { name: 'backend', description: 'APIs, servers, authentication, databases', color: pc.blue },
    { name: 'database', description: 'Queries, schemas, migrations, optimization', color: pc.yellow },
    { name: 'devops', description: 'CI/CD, Docker, Kubernetes, infrastructure', color: pc.magenta },
    { name: 'security', description: 'Audits, vulnerabilities, authentication', color: pc.red },
    { name: 'testing', description: 'Unit tests, E2E, test generation', color: pc.green },
    { name: 'analytics', description: 'Metrics, tracking, data analysis', color: pc.cyan },
    { name: 'automation', description: 'Scripts, workflows, task automation', color: pc.green },
    { name: 'general', description: 'General purpose, code review, docs', color: pc.white },
  ];

  // Header
  logger.log(`  ${pc.dim('Category')}      ${pc.dim('Description')}`);
  logger.log(pc.dim('  ' + '─'.repeat(55)));

  // Rows
  for (const cat of categories) {
    const nameCol = cat.color(cat.name.padEnd(13));
    const descCol = pc.dim(cat.description);
    logger.log(`  ${nameCol} ${descCol}`);
  }

  logger.line();

  // Usage
  logger.log(pc.bold('  Usage:'));
  logger.line();
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync add')} react-patterns ${pc.dim('--category frontend')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync list')} --category devops`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync search')} --category security`);
  logger.line();
}

function showSyncInfo(): void {
  logger.line();
  logger.log(pc.bold(pc.cyan('  Synchronization')));
  logger.line();
  logger.dim('  Sync copies or links your cognitives to provider directories.');
  logger.dim('  This makes them available to each AI provider.');
  logger.line();

  logger.log(pc.bold('  Sync Methods:'));
  logger.line();
  logger.log(`  ${pc.green('symlink')} ${pc.dim('(recommended)')}`);
  logger.dim('    Creates symbolic links to the central storage.');
  logger.dim('    Changes reflect immediately in all providers.');
  logger.dim('    Single source of truth, less disk space.');
  logger.line();
  logger.log(`  ${pc.yellow('copy')}`);
  logger.dim('    Creates independent copies in each provider folder.');
  logger.dim('    Works on systems without symlink support.');
  logger.dim('    Requires re-sync after changes.');
  logger.line();

  logger.log(pc.bold('  How it works:'));
  logger.line();
  logger.log(pc.dim('  Central storage:'));
  logger.log(`    ${pc.cyan('.synapsync/skills/frontend/react-patterns/SKILL.md')}`);
  logger.line();
  logger.log(pc.dim('  After sync (symlink):'));
  logger.log(`    ${pc.green('.claude/skills/react-patterns/')} -> ${pc.dim('../../.synapsync/skills/frontend/react-patterns/')}`);
  logger.log(`    ${pc.green('.openai/skills/react-patterns/')} -> ${pc.dim('../../.synapsync/skills/frontend/react-patterns/')}`);
  logger.line();

  logger.log(pc.bold('  Commands:'));
  logger.line();
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync sync')}                ${pc.dim('# Sync all cognitives to all providers')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync sync')} --provider claude  ${pc.dim('# Sync to specific provider')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync sync')} --type skill       ${pc.dim('# Sync only skills')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync sync')} --copy             ${pc.dim('# Force copy mode')}`);
  logger.log(`  ${pc.dim('$')} ${pc.cyan('synapsync sync')} --dry-run          ${pc.dim('# Preview without changes')}`);
  logger.line();
}

function showStructureInfo(): void {
  logger.line();
  logger.log(pc.bold(pc.cyan('  Project Structure')));
  logger.line();
  logger.dim('  After running `synapsync init`, your project will have:');
  logger.line();

  const structure = `
  ${pc.cyan('.synapsync/')}                    ${pc.dim('# Central cognitive storage')}
  ${pc.dim('├──')} ${pc.white('manifest.json')}            ${pc.dim('# Installed cognitives manifest')}
  ${pc.dim('├──')} ${pc.cyan('skills/')}                   ${pc.dim('# Skills by category')}
  ${pc.dim('│   ├──')} ${pc.cyan('frontend/')}
  ${pc.dim('│   ├──')} ${pc.cyan('backend/')}
  ${pc.dim('│   └──')} ${pc.cyan('general/')}
  ${pc.dim('├──')} ${pc.cyan('agents/')}                   ${pc.dim('# Agents by category')}
  ${pc.dim('├──')} ${pc.cyan('prompts/')}                  ${pc.dim('# Prompts by category')}
  ${pc.dim('├──')} ${pc.cyan('workflows/')}                ${pc.dim('# Workflows by category')}
  ${pc.dim('└──')} ${pc.cyan('tools/')}                    ${pc.dim('# Tools by category')}

  ${pc.green('synapsync.config.yaml')}          ${pc.dim('# Project configuration')}

  ${pc.yellow('.claude/')}                       ${pc.dim('# Claude provider (after sync)')}
  ${pc.dim('├──')} ${pc.white('skills/')}                   ${pc.dim('# Symlinks to .synapsync/skills/*')}
  ${pc.dim('├──')} ${pc.white('agents/')}                   ${pc.dim('# Symlinks to .synapsync/agents/*')}
  ${pc.dim('└──')} ${pc.white('prompts/')}                  ${pc.dim('# Symlinks to .synapsync/prompts/*')}
`;

  logger.log(structure);
  logger.line();
}

// ============================================
// Show all topics (default)
// ============================================

function showAllTopics(): void {
  logger.line();
  logger.log(pc.bold(pc.cyan('  SynapSync Info')));
  logger.line();
  logger.dim('  Use /info with a topic flag to learn more:');
  logger.line();

  const topics = [
    { flag: '--cognitives', desc: 'Types of AI cognitives (skills, agents, prompts, etc.)' },
    { flag: '--add', desc: 'How to add from registry, GitHub, local' },
    { flag: '--providers', desc: 'Supported AI providers (Claude, OpenAI, etc.)' },
    { flag: '--categories', desc: 'Cognitive organization categories' },
    { flag: '--sync', desc: 'How synchronization works' },
    { flag: '--structure', desc: 'Project directory structure' },
  ];

  for (const topic of topics) {
    logger.log(`  ${pc.cyan('/info ' + topic.flag.padEnd(14))} ${pc.dim(topic.desc)}`);
  }

  logger.line();
  logger.dim('  Example: /info --cognitives');
  logger.line();
}

// ============================================
// Parse flags from args string
// ============================================

function parseInfoArgs(argsString: string): string | null {
  const args = argsString.trim().toLowerCase();

  if (!args) {
    return null;
  }

  // Check for --flag format
  const flagMatch = args.match(/^--(\w+)/);
  if (flagMatch?.[1]) {
    return flagMatch[1];
  }

  // Check for direct topic name
  if (INFO_TOPICS[args]) {
    return args;
  }

  return null;
}

// ============================================
// Execute info command (for REPL)
// ============================================

export function executeInfoCommand(args: string): void {
  const topic = parseInfoArgs(args);

  if (!topic) {
    showAllTopics();
    return;
  }

  const topicInfo = INFO_TOPICS[topic];
  if (topicInfo) {
    topicInfo.content();
  } else {
    logger.error(`Unknown topic: ${topic}`);
    logger.line();
    showAllTopics();
  }
}

// ============================================
// Register CLI command
// ============================================

export function registerInfoCommand(program: Command): void {
  program
    .command('info')
    .description('Show information about SynapSync concepts')
    .option('--cognitives', 'Show cognitive types information')
    .option('--add', 'Show installation sources and detection')
    .option('--providers', 'Show supported providers')
    .option('--categories', 'Show cognitive categories')
    .option('--sync', 'Show sync information')
    .option('--structure', 'Show project structure')
    .action((options: Record<string, boolean>) => {
      // Find which flag was passed
      const topic = Object.keys(options).find((key) => options[key] === true);

      if (topic && INFO_TOPICS[topic]) {
        INFO_TOPICS[topic].content();
      } else {
        showAllTopics();
      }
    });
}
