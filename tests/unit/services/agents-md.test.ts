/**
 * AgentsMdGenerator Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { AgentsMdGenerator, regenerateAgentsMd } from '../../../src/services/agents-md/generator.js';
import type { ManifestCognitive } from '../../../src/services/manifest/types.js';
import type { ScannedCognitive } from '../../../src/services/scanner/types.js';

// Mock fs module
vi.mock('fs');

// Shared scan mock that persists across tests
const scanMock = vi.fn<() => ScannedCognitive[]>();

vi.mock('../../../src/services/scanner/scanner.js', () => ({
  CognitiveScanner: class {
    scan() {
      return scanMock();
    }
  },
}));

vi.mock('../../../src/services/manifest/manager.js', () => ({
  ManifestManager: class {
    getCognitives() {
      return [];
    }
  },
}));

describe('AgentsMdGenerator', () => {
  const projectRoot = '/test/project';
  const synapSyncDir = '/test/project/.synapsync';

  const mockSkill: ManifestCognitive = {
    name: 'code-reviewer',
    type: 'skill',
    category: 'general',
    version: '1.0.0',
    installedAt: '2026-01-28T00:00:00.000Z',
    source: 'registry',
    hash: 'abc123',
  };

  const mockAgent: ManifestCognitive = {
    name: 'feature-branch-manager',
    type: 'agent',
    category: 'devops',
    version: '2.0.0',
    installedAt: '2026-01-28T00:00:00.000Z',
    source: 'local',
  };

  const scannedSkill: ScannedCognitive = {
    name: 'code-reviewer',
    type: 'skill',
    category: 'general',
    path: '/test/project/.synapsync/skills/general/code-reviewer',
    filePath: '/test/project/.synapsync/skills/general/code-reviewer/SKILL.md',
    fileName: 'SKILL.md',
    hash: 'abc123',
    metadata: { description: 'Reviews code for quality' },
  };

  const scannedAgent: ScannedCognitive = {
    name: 'feature-branch-manager',
    type: 'agent',
    category: 'devops',
    path: '/test/project/.synapsync/agents/devops/feature-branch-manager',
    filePath: '/test/project/.synapsync/agents/devops/feature-branch-manager/feature-branch-manager.md',
    fileName: 'feature-branch-manager.md',
    hash: 'def456',
    metadata: { description: 'Manages branches' },
  };

  beforeEach(() => {
    vi.mocked(fs.existsSync).mockReset();
    vi.mocked(fs.writeFileSync).mockReset();
    vi.mocked(fs.readFileSync).mockReset();
    vi.mocked(fs.unlinkSync).mockReset();
    scanMock.mockReset().mockReturnValue([]);
  });

  describe('generate', () => {
    it('should create AGENTS.md with cognitive entries', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      scanMock.mockReturnValue([scannedSkill]);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      const result = generator.generate([mockSkill]);

      expect(result.success).toBe(true);
      expect(result.cognitiveCount).toBe(1);
      expect(fs.writeFileSync).toHaveBeenCalled();

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('<!-- synapsync:start -->');
      expect(writtenContent).toContain('<!-- synapsync:end -->');
      expect(writtenContent).toContain('`code-reviewer`');
      expect(writtenContent).toContain('Reviews code for quality');
      expect(writtenContent).toContain('SKILL.md');
    });

    it('should group cognitives by type', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      scanMock.mockReturnValue([scannedSkill, scannedAgent]);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      const result = generator.generate([mockSkill, mockAgent]);

      expect(result.success).toBe(true);
      expect(result.cognitiveCount).toBe(2);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('### \uD83D\uDD27 Skills');
      expect(writtenContent).toContain('### \uD83E\uDD16 Agents');
    });

    it('should omit empty type sections', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      scanMock.mockReturnValue([scannedSkill]);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      generator.generate([mockSkill]);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('### \uD83D\uDD27 Skills');
      expect(writtenContent).not.toContain('### \uD83E\uDD16 Agents');
      expect(writtenContent).not.toContain('### \uD83D\uDCAC Prompts');
      expect(writtenContent).not.toContain('### \uD83D\uDD04 Workflows');
      expect(writtenContent).not.toContain('### \uD83E\uDDF0 Tools');
    });

    it('should render empty state when no cognitives', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      const result = generator.generate([]);

      expect(result.success).toBe(true);
      expect(result.cognitiveCount).toBe(0);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('No cognitives installed yet');
      expect(writtenContent).not.toContain('## Available Cognitives');
    });

    it('should fallback description when cognitive not found by scanner', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      scanMock.mockReturnValue([]);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      generator.generate([mockSkill]);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('No description available');
    });

    it('should truncate long descriptions', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const longDescription = 'A'.repeat(100);
      scanMock.mockReturnValue([
        { ...scannedSkill, metadata: { description: longDescription } },
      ]);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      generator.generate([mockSkill]);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('...');
      expect(writtenContent).not.toContain(longDescription);
    });

    it('should escape pipe characters in table cells', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      scanMock.mockReturnValue([
        { ...scannedSkill, metadata: { description: 'Reviews code | checks quality' } },
      ]);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      generator.generate([mockSkill]);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('Reviews code \\| checks quality');
    });

    it('should handle array descriptions from frontmatter parser', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      scanMock.mockReturnValue([
        { ...scannedSkill, metadata: { description: ['line one', 'line two'] as unknown as string } },
      ]);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      const result = generator.generate([mockSkill]);

      expect(result.success).toBe(true);
      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('line one line two');
    });

    it('should handle undefined description from frontmatter', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      scanMock.mockReturnValue([
        { ...scannedSkill, metadata: {} },
      ]);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      const result = generator.generate([mockSkill]);

      expect(result.success).toBe(true);
      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('No description available');
    });

    it('should return error result when write fails', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      const result = generator.generate([]);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Permission denied');
    });

    it('should include correct relative paths', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      scanMock.mockReturnValue([scannedSkill]);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      generator.generate([mockSkill]);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('[SKILL.md](.synapsync/skills/general/code-reviewer/SKILL.md)');
    });

    it('should include last updated timestamp and count', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});
      scanMock.mockReturnValue([scannedSkill, scannedAgent]);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      generator.generate([mockSkill, mockAgent]);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('2 cognitives installed');
    });
  });

  describe('generateEmpty', () => {
    it('should create file with empty state message', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      const result = generator.generateEmpty();

      expect(result.success).toBe(true);
      expect(result.cognitiveCount).toBe(0);

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('<!-- synapsync:start -->');
      expect(writtenContent).toContain('<!-- synapsync:end -->');
      expect(writtenContent).toContain('No cognitives installed yet');
    });
  });

  describe('remove', () => {
    it('should remove file when it exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.unlinkSync).mockImplementation(() => {});

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      const result = generator.remove();

      expect(result).toBe(true);
      expect(fs.unlinkSync).toHaveBeenCalledWith(
        path.join(projectRoot, 'AGENTS.md')
      );
    });

    it('should return false when file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      const result = generator.remove();

      expect(result).toBe(false);
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });
  });

  describe('marker handling', () => {
    it('should replace content between markers when file exists', () => {
      const existingContent = [
        '# My Project',
        '',
        '<!-- synapsync:start -->',
        'old content',
        '<!-- synapsync:end -->',
        '',
        '## Custom Notes',
      ].join('\n');

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(existingContent);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      generator.generateEmpty();

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('# My Project');
      expect(writtenContent).toContain('## Custom Notes');
      expect(writtenContent).not.toContain('old content');
      expect(writtenContent).toContain('<!-- synapsync:start -->');
      expect(writtenContent).toContain('<!-- synapsync:end -->');
    });

    it('should append markers when file exists without markers', () => {
      const existingContent = '# My Project\n\nSome custom content.\n';

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(existingContent);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      generator.generateEmpty();

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('# My Project');
      expect(writtenContent).toContain('Some custom content.');
      expect(writtenContent).toContain('<!-- synapsync:start -->');
      expect(writtenContent).toContain('<!-- synapsync:end -->');
    });

    it('should handle file with start marker but no end marker', () => {
      const existingContent = [
        '# My Project',
        '',
        '<!-- synapsync:start -->',
        'broken content without end marker',
      ].join('\n');

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(existingContent);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const generator = new AgentsMdGenerator(projectRoot, synapSyncDir);
      generator.generateEmpty();

      const writtenContent = vi.mocked(fs.writeFileSync).mock.calls[0][1] as string;
      expect(writtenContent).toContain('# My Project');
      expect(writtenContent).not.toContain('broken content');
      expect(writtenContent).toContain('<!-- synapsync:start -->');
      expect(writtenContent).toContain('<!-- synapsync:end -->');
    });
  });

  describe('regenerateAgentsMd', () => {
    it('should create generator and call generate', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const result = regenerateAgentsMd(projectRoot, synapSyncDir);

      expect(result.success).toBe(true);
      expect(result.cognitiveCount).toBe(0);
    });
  });
});
