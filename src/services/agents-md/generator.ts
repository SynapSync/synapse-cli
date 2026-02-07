/**
 * AGENTS.md Generator
 *
 * Generates and maintains the AGENTS.md file in the project root.
 * The managed section is delimited by <!-- synapsync:start --> and <!-- synapsync:end -->.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { AgentsMdEntry, AgentsMdResult } from './types.js';
import type { ManifestCognitive } from '../manifest/types.js';
import { ManifestManager } from '../manifest/manager.js';
import { CognitiveScanner } from '../scanner/scanner.js';
import { COGNITIVE_TYPES, AGENTS_MD_FILE_NAME } from '../../core/constants.js';
import type { CognitiveType } from '../../core/constants.js';

const START_MARKER = '<!-- synapsync:start -->';
const END_MARKER = '<!-- synapsync:end -->';

const TYPE_ICONS: Record<CognitiveType, string> = {
  skill: '\uD83D\uDD27',
  agent: '\uD83E\uDD16',
  prompt: '\uD83D\uDCAC',
  workflow: '\uD83D\uDD04',
  tool: '\uD83E\uDDF0',
};

const TYPE_LABELS: Record<CognitiveType, string> = {
  skill: 'Skills',
  agent: 'Agents',
  prompt: 'Prompts',
  workflow: 'Workflows',
  tool: 'Tools',
};

const MAX_DESCRIPTION_LENGTH = 80;

export class AgentsMdGenerator {
  private projectRoot: string;
  private synapSyncDir: string;
  private scanner: CognitiveScanner;

  constructor(projectRoot: string, synapSyncDir: string) {
    this.projectRoot = projectRoot;
    this.synapSyncDir = synapSyncDir;
    this.scanner = new CognitiveScanner(this.synapSyncDir);
  }

  /**
   * Generate and write the AGENTS.md file from manifest cognitives.
   */
  generate(cognitives: ManifestCognitive[]): AgentsMdResult {
    const outputPath = path.join(this.projectRoot, AGENTS_MD_FILE_NAME);

    try {
      const entries = this.buildEntries(cognitives);
      const managedContent = this.renderManagedSection(entries);
      this.writeWithMarkers(outputPath, managedContent);

      return {
        success: true,
        filePath: outputPath,
        cognitiveCount: entries.length,
      };
    } catch (error) {
      return {
        success: false,
        filePath: outputPath,
        cognitiveCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Generate an empty managed section (used by init).
   */
  generateEmpty(): AgentsMdResult {
    const outputPath = path.join(this.projectRoot, AGENTS_MD_FILE_NAME);

    try {
      const managedContent = this.renderEmptySection();
      this.writeWithMarkers(outputPath, managedContent);

      return {
        success: true,
        filePath: outputPath,
        cognitiveCount: 0,
      };
    } catch (error) {
      return {
        success: false,
        filePath: outputPath,
        cognitiveCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Remove the AGENTS.md file entirely (used by purge).
   */
  remove(): boolean {
    const outputPath = path.join(this.projectRoot, AGENTS_MD_FILE_NAME);
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
      return true;
    }
    return false;
  }

  /**
   * Build enriched entries from manifest cognitives.
   * Scans filesystem for descriptions from frontmatter.
   */
  private buildEntries(cognitives: ManifestCognitive[]): AgentsMdEntry[] {
    // Scan filesystem to get descriptions and file paths
    const scanned = this.scanner.scan();
    const scannedMap = new Map(scanned.map((s) => [s.name, s]));

    const entries: AgentsMdEntry[] = [];

    for (const cognitive of cognitives) {
      const scannedCognitive = scannedMap.get(cognitive.name);

      let description = 'No description available';
      let relativePath = '';
      let fileName = '';

      if (scannedCognitive !== undefined) {
        const rawDesc = scannedCognitive.metadata.description;
        if (typeof rawDesc === 'string' && rawDesc.length > 0) {
          description = rawDesc;
        } else if (Array.isArray(rawDesc) && rawDesc.length > 0) {
          description = rawDesc.join(' ');
        }
        relativePath = path.relative(this.projectRoot, scannedCognitive.filePath);
        fileName = scannedCognitive.fileName ?? path.basename(scannedCognitive.filePath);
      } else {
        // Fallback: build expected path from manifest data
        const typeDir = `${cognitive.type}s`;
        const expectedDir = path.join(
          this.synapSyncDir,
          typeDir,
          cognitive.category,
          cognitive.name
        );
        relativePath = path.relative(this.projectRoot, expectedDir);
        fileName = cognitive.name;
      }

      entries.push({
        name: cognitive.name,
        type: cognitive.type,
        category: cognitive.category,
        description: truncateDescription(description),
        version: cognitive.version,
        relativePath,
        fileName,
      });
    }

    // Sort alphabetically by name within each type
    entries.sort((a, b) => a.name.localeCompare(b.name));

    return entries;
  }

  /**
   * Render the full managed section (between markers).
   */
  private renderManagedSection(entries: AgentsMdEntry[]): string {
    const lines: string[] = [
      START_MARKER,
      '# SynapSync Project Cognitives',
      '',
      '> Auto-generated by [SynapSync](https://synapsync.github.io/synapse-cli/). Do not edit this section manually.',
      '',
    ];

    if (entries.length === 0) {
      lines.push('*No cognitives installed yet. Run `synapsync add <name>` to get started.*');
    } else {
      lines.push('## Available Cognitives');
      lines.push('');

      for (const type of COGNITIVE_TYPES) {
        const typeEntries = entries.filter((e) => e.type === type);
        if (typeEntries.length === 0) continue;

        lines.push(`### ${TYPE_ICONS[type]} ${TYPE_LABELS[type]}`);
        lines.push('');
        lines.push(...this.renderTypeTable(typeEntries));
        lines.push('');
      }

      lines.push('---');
      lines.push('');
      lines.push(
        `*Last updated: ${new Date().toISOString()} \u00B7 ${entries.length} cognitive${entries.length !== 1 ? 's' : ''} installed*`
      );
    }

    lines.push(END_MARKER);

    return lines.join('\n');
  }

  /**
   * Render the empty managed section.
   */
  private renderEmptySection(): string {
    const lines: string[] = [
      START_MARKER,
      '# SynapSync Project Cognitives',
      '',
      '> Auto-generated by [SynapSync](https://synapsync.github.io/synapse-cli/). Do not edit this section manually.',
      '',
      '*No cognitives installed yet. Run `synapsync add <name>` to get started.*',
      END_MARKER,
    ];

    return lines.join('\n');
  }

  /**
   * Render a markdown table for a group of entries.
   */
  private renderTypeTable(entries: AgentsMdEntry[]): string[] {
    const lines: string[] = [
      '| Name | Category | Description | Version | Path |',
      '|------|----------|-------------|---------|------|',
    ];

    for (const entry of entries) {
      const name = `\`${escapeTableCell(entry.name)}\``;
      const category = escapeTableCell(entry.category);
      const description = escapeTableCell(entry.description);
      const version = escapeTableCell(entry.version);
      const pathLink = `[${escapeTableCell(entry.fileName)}](${entry.relativePath})`;

      lines.push(`| ${name} | ${category} | ${description} | ${version} | ${pathLink} |`);
    }

    return lines;
  }

  /**
   * Write content within markers, preserving user content outside.
   */
  private writeWithMarkers(filePath: string, managedContent: string): void {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, managedContent + '\n', 'utf-8');
      return;
    }

    const existing = fs.readFileSync(filePath, 'utf-8');
    const startIdx = existing.indexOf(START_MARKER);
    const endIdx = existing.indexOf(END_MARKER);

    if (startIdx !== -1 && endIdx !== -1) {
      // Replace content between markers (inclusive)
      const before = existing.slice(0, startIdx);
      const after = existing.slice(endIdx + END_MARKER.length);
      fs.writeFileSync(filePath, before + managedContent + after, 'utf-8');
    } else if (startIdx !== -1 && endIdx === -1) {
      // Start marker found but no end marker — replace from start to EOF
      const before = existing.slice(0, startIdx);
      fs.writeFileSync(filePath, before + managedContent + '\n', 'utf-8');
    } else {
      // No markers found — append
      const separator = existing.endsWith('\n') ? '\n' : '\n\n';
      fs.writeFileSync(filePath, existing + separator + managedContent + '\n', 'utf-8');
    }
  }
}

/**
 * Truncate description to max length with ellipsis.
 */
function truncateDescription(description: string): string {
  const text = String(description ?? '');
  if (text.length <= MAX_DESCRIPTION_LENGTH) {
    return text;
  }
  return text.slice(0, MAX_DESCRIPTION_LENGTH - 3) + '...';
}

/**
 * Escape pipe characters for markdown table cells.
 */
function escapeTableCell(value: string): string {
  return String(value ?? '').replace(/\|/g, '\\|');
}

/**
 * Convenience function to regenerate AGENTS.md from the current manifest.
 * Safe to call after any manifest mutation.
 */
export function regenerateAgentsMd(projectRoot: string, synapSyncDir: string): AgentsMdResult {
  const manifest = new ManifestManager(synapSyncDir);
  const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
  return generator.generate(manifest.getCognitives());
}
