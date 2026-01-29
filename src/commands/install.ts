/**
 * Install Command
 *
 * Install cognitives from registry, local path, or GitHub
 */

import * as fs from 'fs';
import * as path from 'path';
import type { Command } from 'commander';
import pc from 'picocolors';
import { RegistryClient, CognitiveNotFoundError, RegistryError } from '../services/registry/client.js';
import { ConfigManager } from '../services/config/manager.js';
import { SyncEngine } from '../services/sync/engine.js';
import {
  COGNITIVE_TYPES,
  COGNITIVE_FILE_NAMES,
} from '../core/constants.js';
import type { CognitiveType, Category } from '../core/constants.js';
import type { InstalledCognitive, CognitiveManifest } from '../types/index.js';
import { logger } from '../utils/logger.js';

// ============================================
// Types
// ============================================

interface InstallCommandOptions {
  type?: string;
  category?: string;
  force?: boolean;
  global?: boolean;
  sync?: boolean;
}

interface InstallSource {
  type: 'registry' | 'local' | 'github';
  name: string;
  path?: string;
  url?: string;
  branch?: string;
}

// ============================================
// Main Function
// ============================================

/**
 * Execute the install command
 */
export async function executeInstallCommand(
  source: string,
  options: InstallCommandOptions
): Promise<void> {
  logger.line();

  // Check if project is initialized
  const configManager = ConfigManager.findConfig();
  if (configManager === null) {
    logger.error('No SynapSync project found.');
    logger.hint('Run synapsync init to initialize a project first.');
    return;
  }

  // Parse the source
  const parsedSource = parseSource(source);
  logger.log(`  ${pc.dim(`Installing from ${parsedSource.type}...`)}`);

  let success = false;

  try {
    switch (parsedSource.type) {
      case 'registry':
        success = await installFromRegistry(parsedSource.name, options, configManager);
        break;
      case 'local':
        if (parsedSource.path !== undefined) {
          success = installFromLocal(parsedSource.path, options, configManager);
        }
        break;
      case 'github':
        success = installFromGitHub(parsedSource, options, configManager);
        break;
    }

    // Auto-sync if --sync flag is provided and installation succeeded
    if (success && options.sync === true) {
      logger.log(`  ${pc.dim('Syncing to providers...')}`);
      const synapSyncDir = configManager.getSynapSyncDir();
      const projectRoot = configManager.getProjectRoot();
      const config = configManager.getConfig();
      const syncEngine = new SyncEngine(synapSyncDir, projectRoot, config);
      const result = syncEngine.sync({ force: options.force ?? false });

      if (result.providerResults && result.providerResults.length > 0) {
        for (const pr of result.providerResults) {
          const created = pr.created.filter(c => c.success).length;
          const skipped = pr.skipped.length;
          if (created > 0) {
            logger.log(`  ${pc.green('✓')} Synced to ${pr.provider} (${created} created)`);
          } else if (skipped > 0) {
            logger.log(`  ${pc.green('✓')} Synced to ${pr.provider} (already up to date)`);
          }
        }
      }
      logger.line();
    }
  } catch (error) {
    logger.line();
    if (error instanceof CognitiveNotFoundError) {
      logger.error(`Cognitive '${error.cognitiveName}' not found in registry.`);
      logger.hint('Run synapsync search to find available cognitives.');
    } else if (error instanceof RegistryError) {
      logger.error(`Registry error: ${error.message}`);
    } else if (error instanceof Error) {
      logger.error(`Installation failed: ${error.message}`);
    } else {
      logger.error('Installation failed with unknown error');
    }
  }
}

// ============================================
// Source Parsing
// ============================================

function parseSource(source: string): InstallSource {
  // Local path: starts with ./ or / or contains path separators
  if (source.startsWith('./') || source.startsWith('/') || source.startsWith('../')) {
    return {
      type: 'local',
      name: path.basename(source),
      path: source,
    };
  }

  // GitHub shorthand: github:user/repo or github:user/repo#branch
  if (source.startsWith('github:')) {
    const rest = source.slice(7);
    const [repoPath, branch] = rest.split('#');
    const parts = repoPath?.split('/') ?? [];

    return {
      type: 'github',
      name: parts[parts.length - 1] ?? repoPath ?? source,
      url: `https://github.com/${repoPath}`,
      branch: branch ?? 'main',
    };
  }

  // GitHub URL: https://github.com/user/repo
  if (source.startsWith('https://github.com/')) {
    const urlPath = source.replace('https://github.com/', '');
    const [repoPath, branch] = urlPath.split('#');
    const parts = repoPath?.split('/') ?? [];

    return {
      type: 'github',
      name: parts[parts.length - 1] ?? repoPath ?? source,
      url: `https://github.com/${repoPath}`,
      branch: branch ?? 'main',
    };
  }

  // Default: registry name
  return {
    type: 'registry',
    name: source,
  };
}

// ============================================
// Registry Installation
// ============================================

async function installFromRegistry(
  name: string,
  options: InstallCommandOptions,
  configManager: ConfigManager
): Promise<boolean> {
  const client = new RegistryClient();

  // Download cognitive
  const downloaded = await client.download(name);
  const manifest = downloaded.manifest;

  // Determine category
  const category = options.category ?? manifest.category;

  // Check if already installed
  const targetDir = getTargetDir(configManager, manifest.type, category, manifest.name);

  if (fs.existsSync(targetDir) && options.force !== true) {
    logger.line();
    logger.error(`Cognitive '${manifest.name}' is already installed.`);
    logger.hint('Use --force to overwrite.');
    return false;
  }

  // Download assets if any (check for assets folder)
  const assets = await downloadAssets(client, name, manifest);

  // Save files
  saveCognitive(targetDir, manifest, downloaded.content, assets);

  // Update manifest.json
  updateProjectManifest(configManager, manifest, 'registry');

  // Success
  logger.line();
  logger.log(`  ${pc.green('✓')} Installed ${pc.bold(manifest.name)} ${pc.dim(`v${manifest.version}`)}`);
  logger.log(`    ${pc.dim('Type:')} ${manifest.type}`);
  logger.log(`    ${pc.dim('Category:')} ${category}`);
  logger.log(`    ${pc.dim('Location:')} ${path.relative(process.cwd(), targetDir)}`);

  if (options.sync !== true) {
    logger.line();
    logger.hint('Run synapsync sync to sync to your providers.');
  }

  return true;
}

async function downloadAssets(
  client: RegistryClient,
  name: string,
  _manifest: CognitiveManifest
): Promise<Map<string, string>> {
  const assets = new Map<string, string>();

  // Find the cognitive entry first
  const entry = await client.findByName(name);
  if (entry === null) return assets;

  // Try to download common asset files
  const assetFiles = [
    'assets/SKILL-TEMPLATE-BASIC.md',
    'assets/SKILL-TEMPLATE-ADVANCED.md',
  ];

  for (const assetPath of assetFiles) {
    try {
      const content = await client.downloadAsset(entry, assetPath);
      assets.set(assetPath, content);
    } catch {
      // Asset doesn't exist, skip
    }
  }

  return assets;
}

// ============================================
// Local Installation
// ============================================

function installFromLocal(
  sourcePath: string,
  options: InstallCommandOptions,
  configManager: ConfigManager
): boolean {
  const absolutePath = path.resolve(process.cwd(), sourcePath);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Path not found: ${absolutePath}`);
  }

  // Detect cognitive type and filename
  const detected = detectCognitiveType(absolutePath);

  if (detected === null && options.type === undefined) {
    throw new Error(
      'Could not detect cognitive type. Please specify with --type flag.'
    );
  }

  const cognitiveType = (options.type as CognitiveType) ?? detected?.type ?? 'skill';
  const fileName = detected?.fileName ?? COGNITIVE_FILE_NAMES[cognitiveType];

  // Read the cognitive file
  const filePath = path.join(absolutePath, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Cognitive file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const metadata = parseMetadata(content);
  const name = (metadata['name'] as string) ?? path.basename(absolutePath);
  const category = (options.category as Category) ?? (metadata['category'] as Category) ?? 'general';

  // Create manifest from metadata - use original filename
  const manifest: CognitiveManifest = {
    name,
    type: cognitiveType,
    version: (metadata['version'] as string) ?? '1.0.0',
    description: (metadata['description'] as string) ?? '',
    author: (metadata['author'] as string) ?? 'local',
    license: (metadata['license'] as string) ?? 'MIT',
    category,
    tags: (metadata['tags'] as string[]) ?? [],
    providers: ((metadata['providers'] as string[]) ?? []) as CognitiveManifest['providers'],
    file: fileName, // Use the original filename
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Check if already installed
  const targetDir = getTargetDir(configManager, cognitiveType, category, name);

  if (fs.existsSync(targetDir) && options.force !== true) {
    logger.line();
    logger.error(`Cognitive '${name}' is already installed.`);
    logger.hint('Use --force to overwrite.');
    return false;
  }

  // Copy all files from source
  const assets = new Map<string, string>();
  const assetsDir = path.join(absolutePath, 'assets');
  if (fs.existsSync(assetsDir)) {
    const assetFiles = fs.readdirSync(assetsDir);
    for (const file of assetFiles) {
      const assetContent = fs.readFileSync(path.join(assetsDir, file), 'utf-8');
      assets.set(`assets/${file}`, assetContent);
    }
  }

  // Save files
  saveCognitive(targetDir, manifest, content, assets);

  // Update manifest.json
  updateProjectManifest(configManager, manifest, 'local');

  // Success
  logger.line();
  logger.log(`  ${pc.green('✓')} Installed ${pc.bold(name)} ${pc.dim(`v${manifest.version}`)}`);
  logger.log(`    ${pc.dim('Type:')} ${cognitiveType}`);
  logger.log(`    ${pc.dim('Category:')} ${category}`);
  logger.log(`    ${pc.dim('Source:')} local`);
  logger.log(`    ${pc.dim('Location:')} ${path.relative(process.cwd(), targetDir)}`);

  if (options.sync !== true) {
    logger.line();
    logger.hint('Run synapsync sync to sync to your providers.');
  }

  return true;
}

/**
 * Detect cognitive type from directory contents
 * Checks for legacy fixed filenames first, then by extension
 */
function detectCognitiveType(dirPath: string): { type: CognitiveType; fileName: string } | null {
  // First check for legacy fixed filenames
  for (const type of COGNITIVE_TYPES) {
    const fileName = COGNITIVE_FILE_NAMES[type];
    if (fs.existsSync(path.join(dirPath, fileName))) {
      return { type, fileName };
    }
  }

  // If not found, check for files by extension
  if (!fs.existsSync(dirPath)) return null;

  const files = fs.readdirSync(dirPath);

  // Check for workflow first (yaml extension)
  for (const file of files) {
    if (file.endsWith('.yaml') && !file.startsWith('.')) {
      return { type: 'workflow', fileName: file };
    }
  }

  // Check for markdown files (could be skill, agent, prompt, or tool)
  // We need to parse frontmatter to determine the type
  for (const file of files) {
    if (file.endsWith('.md') && !file.startsWith('.')) {
      const content = fs.readFileSync(path.join(dirPath, file), 'utf-8');
      const metadata = parseMetadata(content);
      const detectedType = (metadata['type'] as CognitiveType) ?? 'skill'; // Default to skill
      if (COGNITIVE_TYPES.includes(detectedType)) {
        return { type: detectedType, fileName: file };
      }
    }
  }

  return null;
}

function parseMetadata(content: string): Record<string, unknown> {
  // Parse YAML frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (match?.[1] === undefined) {
    return {};
  }

  try {
    // Simple YAML parsing (key: value)
    const result: Record<string, unknown> = {};
    const lines = match[1].split('\n');

    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        let value: unknown = line.slice(colonIndex + 1).trim();

        // Remove quotes
        if (typeof value === 'string') {
          if ((value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
        }

        result[key] = value;
      }
    }

    return result;
  } catch {
    return {};
  }
}

// ============================================
// GitHub Installation
// ============================================

function installFromGitHub(
  _source: InstallSource,
  _options: InstallCommandOptions,
  _configManager: ConfigManager
): boolean {
  // For now, we'll use raw GitHub URLs similar to registry
  // This is a simplified implementation
  logger.line();
  logger.error('GitHub installation is not yet fully implemented.');
  logger.hint('For now, clone the repo locally and use: synapsync install ./path/to/cognitive');
  return false;
}

// ============================================
// File Operations
// ============================================

function getTargetDir(
  configManager: ConfigManager,
  type: CognitiveType,
  category: Category,
  name: string
): string {
  const synapSyncDir = configManager.getSynapSyncDir();
  return path.join(synapSyncDir, `${type}s`, category, name);
}

function saveCognitive(
  targetDir: string,
  manifest: CognitiveManifest,
  content: string,
  assets: Map<string, string>
): void {
  // Create directory structure
  fs.mkdirSync(targetDir, { recursive: true });

  // Save main file
  const mainFilePath = path.join(targetDir, manifest.file);
  fs.writeFileSync(mainFilePath, content, 'utf-8');

  // Save assets
  for (const [assetPath, assetContent] of assets) {
    const fullPath = path.join(targetDir, assetPath);
    const assetDir = path.dirname(fullPath);
    fs.mkdirSync(assetDir, { recursive: true });
    fs.writeFileSync(fullPath, assetContent, 'utf-8');
  }
}

function updateProjectManifest(
  configManager: ConfigManager,
  manifest: CognitiveManifest,
  source: 'registry' | 'local' | 'github'
): void {
  const synapSyncDir = configManager.getSynapSyncDir();
  const manifestPath = path.join(synapSyncDir, 'manifest.json');

  // Read existing manifest or create new one
  let projectManifest: {
    version: string;
    lastUpdated: string;
    cognitives: Record<string, InstalledCognitive>;
    syncs: Record<string, unknown>;
  };

  if (fs.existsSync(manifestPath)) {
    const content = fs.readFileSync(manifestPath, 'utf-8');
    projectManifest = JSON.parse(content) as typeof projectManifest;
  } else {
    projectManifest = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      cognitives: {},
      syncs: {},
    };
  }

  // Add or update cognitive entry
  const mappedSource = source === 'github' ? 'git' as const : source;
  const entry: InstalledCognitive = {
    name: manifest.name,
    type: manifest.type,
    category: manifest.category,
    version: manifest.version,
    installedAt: new Date(),
    source: mappedSource,
  };
  if (source === 'registry') {
    entry.sourceUrl = 'https://github.com/SynapSync/synapse-registry';
  }
  projectManifest.cognitives[manifest.name] = entry;

  projectManifest.lastUpdated = new Date().toISOString();

  // Save manifest
  fs.writeFileSync(manifestPath, JSON.stringify(projectManifest, null, 2), 'utf-8');
}

// ============================================
// Command Registration
// ============================================

/**
 * Register install command with Commander
 */
export function registerInstallCommand(program: Command): void {
  program
    .command('install <source>')
    .description('Install a cognitive from registry, local path, or GitHub')
    .option('-t, --type <type>', 'Cognitive type (skill, agent, prompt, workflow, tool)')
    .option('-c, --category <category>', 'Category (overrides default)')
    .option('-f, --force', 'Overwrite if already installed')
    .option('-s, --sync', 'Sync to providers after installation')
    .option('-g, --global', 'Install globally (not yet implemented)')
    .action(async (source: string, options: InstallCommandOptions) => {
      await executeInstallCommand(source, options);
    });
}
