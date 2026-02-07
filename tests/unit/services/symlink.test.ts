/**
 * Symlink Manager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { SymlinkManager } from '../../../src/services/symlink/manager.js';
import type { ScannedCognitive } from '../../../src/services/scanner/types.js';

// Mock fs
vi.mock('fs');

// ============================================
// Test Data
// ============================================

const projectRoot = '/test/project';
const synapSyncDir = '/test/project/.synapsync';

const skillCognitive: ScannedCognitive = {
  name: 'code-reviewer',
  type: 'skill',
  category: 'general',
  path: '/test/project/.synapsync/skills/general/code-reviewer',
  filePath: '/test/project/.synapsync/skills/general/code-reviewer/SKILL.md',
  hash: 'abc123',
  metadata: { name: 'code-reviewer' },
};

const agentCognitive: ScannedCognitive = {
  name: 'test-agent',
  type: 'agent',
  category: 'testing',
  path: '/test/project/.synapsync/agents/testing/test-agent',
  filePath: '/test/project/.synapsync/agents/testing/test-agent/test-agent.md',
  fileName: 'test-agent.md',
  hash: 'def456',
  metadata: { name: 'test-agent' },
};

// ============================================
// Tests
// ============================================

describe('SymlinkManager', () => {
  let manager: SymlinkManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new SymlinkManager(projectRoot, synapSyncDir);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkSymlinkSupport', () => {
    it('should return true on non-Windows platforms', () => {
      const result = manager.checkSymlinkSupport();
      // darwin is non-win32
      expect(result).toBe(true);
    });

    it('should cache the result', () => {
      const first = manager.checkSymlinkSupport();
      const second = manager.checkSymlinkSupport();

      expect(first).toBe(second);
    });
  });

  describe('syncProvider', () => {
    beforeEach(() => {
      // Default: directories exist, no existing links
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.readdirSync).mockReturnValue([]);
      vi.mocked(fs.mkdirSync).mockImplementation(() => undefined);
      vi.mocked(fs.symlinkSync).mockImplementation(() => undefined);
    });

    it('should create symlinks for cognitives', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = manager.syncProvider('claude', [agentCognitive]);

      expect(result.provider).toBe('claude');
      expect(result.created).toHaveLength(1);
      expect(result.method).toBe('symlink');
    });

    it('should create folder symlinks for skills', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = manager.syncProvider('claude', [skillCognitive]);

      expect(result.created).toHaveLength(1);
      expect(fs.symlinkSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('code-reviewer'),
        'dir'
      );
    });

    it('should create file symlinks for agents', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = manager.syncProvider('claude', [agentCognitive]);

      expect(result.created).toHaveLength(1);
      expect(fs.symlinkSync).toHaveBeenCalledWith(
        expect.any(String),
        expect.stringContaining('test-agent.md'),
        'file'
      );
    });

    it('should use copy when specified', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = manager.syncProvider('claude', [agentCognitive], { copy: true });

      expect(result.method).toBe('copy');
      expect(fs.copyFileSync).toHaveBeenCalled();
    });

    it('should skip existing valid links', () => {
      // First call: existsSync for provider dir
      // We need getExistingLinks to find something
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'test-agent.md', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => true },
      ] as unknown as fs.Dirent[]);
      vi.mocked(fs.lstatSync).mockReturnValue({
        isSymbolicLink: () => true,
        isDirectory: () => false,
        isFile: () => false,
      } as unknown as fs.Stats);
      vi.mocked(fs.statSync).mockReturnValue({
        isDirectory: () => false,
      } as unknown as fs.Stats);
      vi.mocked(fs.readlinkSync).mockReturnValue('../../.synapsync/agents/testing/test-agent/test-agent.md');

      const result = manager.syncProvider('claude', [agentCognitive]);

      expect(result.skipped).toContain('test-agent');
    });

    it('should force recreate links when force option is set', () => {
      // Simulate existing file at target
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        // Provider dirs don't exist (so getExistingLinks returns empty)
        if (pathStr.includes('.claude/agents') && !pathStr.includes('test-agent')) return false;
        if (pathStr.includes('.claude/skills') && !pathStr.includes('code-reviewer')) return false;
        // Target file exists
        return pathStr.includes('test-agent.md');
      });
      vi.mocked(fs.readdirSync).mockReturnValue([]);
      vi.mocked(fs.lstatSync).mockReturnValue({
        isSymbolicLink: () => true,
        isFile: () => false,
        isDirectory: () => false,
      } as unknown as fs.Stats);

      const result = manager.syncProvider('claude', [agentCognitive], { force: true });

      expect(result.created).toHaveLength(1);
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should report error for unknown provider', () => {
      const result = manager.syncProvider('unknown' as any, [agentCognitive]);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toContain('Unknown provider');
    });

    it('should handle dry run without making changes', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      const result = manager.syncProvider('claude', [agentCognitive], { dryRun: true });

      expect(result.created).toHaveLength(1);
      expect(result.created[0]?.success).toBe(true);
      expect(fs.symlinkSync).not.toHaveBeenCalled();
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });

    it('should remove orphaned links', () => {
      // Simulate existing link that is no longer in cognitives
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((p) => {
        if (String(p).includes('.claude/agents')) {
          return [
            { name: 'old-agent.md', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => true },
          ] as unknown as fs.Dirent[];
        }
        return [] as unknown as fs.Dirent[];
      });
      vi.mocked(fs.lstatSync).mockReturnValue({
        isSymbolicLink: () => true,
        isDirectory: () => false,
        isFile: () => false,
      } as unknown as fs.Stats);
      vi.mocked(fs.statSync).mockReturnValue({
        isDirectory: () => false,
      } as unknown as fs.Stats);
      vi.mocked(fs.readlinkSync).mockReturnValue('../../.synapsync/agents/general/old-agent/old-agent.md');

      const result = manager.syncProvider('claude', []);

      expect(result.removed).toContain('old-agent');
    });

    it('should handle remove errors gracefully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((p) => {
        if (String(p).includes('.claude/agents')) {
          return [
            { name: 'old-agent.md', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => true },
          ] as unknown as fs.Dirent[];
        }
        return [] as unknown as fs.Dirent[];
      });
      vi.mocked(fs.lstatSync).mockImplementation((p) => {
        if (String(p).includes('old-agent')) {
          return {
            isSymbolicLink: () => true,
            isDirectory: () => false,
            isFile: () => false,
          } as unknown as fs.Stats;
        }
        throw new Error('lstat error');
      });
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => false } as unknown as fs.Stats);
      vi.mocked(fs.readlinkSync).mockReturnValue('../../.synapsync/agents/general/old-agent/old-agent.md');
      vi.mocked(fs.unlinkSync).mockImplementation(() => {
        throw new Error('Permission denied');
      });

      const result = manager.syncProvider('claude', []);

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fall back to copy when symlink creation fails', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.readdirSync).mockReturnValue([]);
      vi.mocked(fs.symlinkSync).mockImplementation(() => {
        throw new Error('Symlink not supported');
      });

      const result = manager.syncProvider('claude', [agentCognitive]);

      expect(result.created).toHaveLength(1);
      expect(result.created[0]?.method).toBe('copy');
      expect(fs.copyFileSync).toHaveBeenCalled();
    });

    it('should report error when both symlink and copy fail', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(fs.readdirSync).mockReturnValue([]);
      vi.mocked(fs.symlinkSync).mockImplementation(() => {
        throw new Error('Symlink failed');
      });
      vi.mocked(fs.copyFileSync).mockImplementation(() => {
        throw new Error('Copy failed');
      });

      const result = manager.syncProvider('claude', [agentCognitive]);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]?.message).toBe('Copy failed');
    });

    it('should return error when target already exists and force is not set', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([]);

      const result = manager.syncProvider('claude', [agentCognitive]);

      expect(result.created).toHaveLength(1);
      expect(result.created[0]?.success).toBe(false);
      expect(result.created[0]?.error).toContain('already exists');
    });
  });

  describe('getExistingLinks', () => {
    it('should scan provider directories for links', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'my-skill', isFile: () => false, isDirectory: () => true, isSymbolicLink: () => false },
      ] as unknown as fs.Dirent[]);
      vi.mocked(fs.lstatSync).mockReturnValue({
        isSymbolicLink: () => false,
        isDirectory: () => true,
        isFile: () => false,
      } as unknown as fs.Stats);

      const links = manager.getExistingLinks('claude');

      expect(links.length).toBeGreaterThan(0);
    });

    it('should skip hidden entries', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: '.hidden', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false },
      ] as unknown as fs.Dirent[]);

      const links = manager.getExistingLinks('claude');

      expect(links).toHaveLength(0);
    });

    it('should skip directories that do not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const links = manager.getExistingLinks('claude');

      expect(links).toHaveLength(0);
    });

    it('should handle broken symlinks', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        // Provider type directories exist (e.g., /test/project/.claude/agents)
        if (pathStr.endsWith('/agents') || pathStr.endsWith('/skills') ||
            pathStr.endsWith('/prompts') || pathStr.endsWith('/workflows') ||
            pathStr.endsWith('/tools')) return true;
        // All other paths (including resolved symlink targets) don't exist
        return false;
      });
      vi.mocked(fs.readdirSync).mockImplementation((p) => {
        if (String(p).includes('.claude/agents')) {
          return [
            { name: 'broken-link.md', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true },
          ] as unknown as fs.Dirent[];
        }
        return [] as unknown as fs.Dirent[];
      });
      vi.mocked(fs.lstatSync).mockReturnValue({
        isSymbolicLink: () => true,
        isDirectory: () => false,
        isFile: () => false,
      } as unknown as fs.Stats);
      vi.mocked(fs.statSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      vi.mocked(fs.readlinkSync).mockReturnValue('../../.synapsync/agents/broken/broken-link.md');

      const links = manager.getExistingLinks('claude');

      const brokenLink = links.find((l) => l.cognitiveName === 'broken-link');
      expect(brokenLink?.isValid).toBe(false);
    });

    it('should handle getLinkInfo errors gracefully', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'error-link.md', isFile: () => true, isDirectory: () => false, isSymbolicLink: () => false },
      ] as unknown as fs.Dirent[]);
      vi.mocked(fs.lstatSync).mockImplementation(() => {
        throw new Error('Access denied');
      });

      const links = manager.getExistingLinks('claude');

      // Should silently skip entries that error
      expect(links).toHaveLength(0);
    });
  });

  describe('verifyProvider', () => {
    it('should categorize links as valid, broken, or orphaned', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((p) => {
        if (String(p).includes('.claude/agents')) {
          return [
            { name: 'valid-agent.md', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true },
            { name: 'broken-agent.md', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true },
          ] as unknown as fs.Dirent[];
        }
        return [] as unknown as fs.Dirent[];
      });

      let callCount = 0;
      vi.mocked(fs.lstatSync).mockImplementation(() => ({
        isSymbolicLink: () => true,
        isDirectory: () => false,
        isFile: () => false,
      }) as unknown as fs.Stats);

      vi.mocked(fs.statSync).mockImplementation((p) => {
        if (String(p).includes('broken-agent')) {
          throw new Error('ENOENT');
        }
        return { isDirectory: () => false } as unknown as fs.Stats;
      });

      vi.mocked(fs.readlinkSync).mockImplementation((p) => {
        if (String(p).includes('broken-agent')) {
          return '../.synapsync/missing';
        }
        return '../../.synapsync/agents/testing/valid-agent/valid-agent.md';
      });

      const result = manager.verifyProvider('claude');

      expect(result.valid.length + result.broken.length + result.orphaned.length).toBeGreaterThan(0);
    });

    it('should detect broken symlinks', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        // Provider dir exists, but resolved symlink target doesn't
        if (String(p).includes('.claude/')) return true;
        return false;
      });
      vi.mocked(fs.readdirSync).mockImplementation((p) => {
        if (String(p).includes('.claude/skills')) {
          return [
            { name: 'broken-skill', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true },
          ] as unknown as fs.Dirent[];
        }
        return [] as unknown as fs.Dirent[];
      });
      vi.mocked(fs.lstatSync).mockReturnValue({
        isSymbolicLink: () => true,
        isDirectory: () => false,
        isFile: () => false,
      } as unknown as fs.Stats);
      vi.mocked(fs.statSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      vi.mocked(fs.readlinkSync).mockReturnValue('../../.synapsync/skills/general/broken-skill');

      const result = manager.verifyProvider('claude');

      expect(result.broken).toHaveLength(1);
      expect(result.broken[0]?.cognitiveName).toBe('broken-skill');
    });
  });

  describe('cleanProvider', () => {
    it('should remove broken and orphaned links', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = String(p);
        if (pathStr.endsWith('/agents') || pathStr.endsWith('/skills') ||
            pathStr.endsWith('/prompts') || pathStr.endsWith('/workflows') ||
            pathStr.endsWith('/tools')) return true;
        return false;
      });
      vi.mocked(fs.readdirSync).mockImplementation((p) => {
        if (String(p).endsWith('.claude/agents')) {
          return [
            { name: 'broken-agent.md', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true },
          ] as unknown as fs.Dirent[];
        }
        return [] as unknown as fs.Dirent[];
      });
      vi.mocked(fs.lstatSync).mockImplementation(
        () =>
          ({
            isSymbolicLink: () => true,
            isDirectory: () => false,
            isFile: () => false,
          }) as unknown as fs.Stats
      );
      vi.mocked(fs.statSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      vi.mocked(fs.readlinkSync).mockReturnValue('../../.synapsync/agents/broken/broken-agent.md');
      vi.mocked(fs.unlinkSync).mockImplementation(() => undefined);

      const removed = manager.cleanProvider('claude');

      expect(removed).toContain('broken-agent');
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('should only report in dry run', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        if (String(p).includes('.claude/')) return true;
        return false;
      });
      vi.mocked(fs.readdirSync).mockImplementation((p) => {
        if (String(p).includes('.claude/agents')) {
          return [
            { name: 'broken-agent.md', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true },
          ] as unknown as fs.Dirent[];
        }
        return [] as unknown as fs.Dirent[];
      });
      vi.mocked(fs.lstatSync).mockReturnValue({
        isSymbolicLink: () => true,
        isDirectory: () => false,
        isFile: () => false,
      } as unknown as fs.Stats);
      vi.mocked(fs.statSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      vi.mocked(fs.readlinkSync).mockReturnValue('../../.synapsync/agents/broken');

      const removed = manager.cleanProvider('claude', true);

      expect(removed).toContain('broken-agent');
      expect(fs.unlinkSync).not.toHaveBeenCalled();
    });

    it('should handle errors during cleanup silently', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        if (String(p).includes('.claude/')) return true;
        return false;
      });
      vi.mocked(fs.readdirSync).mockImplementation((p) => {
        if (String(p).includes('.claude/agents')) {
          return [
            { name: 'broken-agent.md', isFile: () => false, isDirectory: () => false, isSymbolicLink: () => true },
          ] as unknown as fs.Dirent[];
        }
        return [] as unknown as fs.Dirent[];
      });
      vi.mocked(fs.lstatSync).mockImplementation((p) => {
        // First call from getExistingLinks / getLinkInfo
        if (String(p).includes('broken-agent')) {
          return {
            isSymbolicLink: () => true,
            isDirectory: () => false,
            isFile: () => false,
          } as unknown as fs.Stats;
        }
        throw new Error('Permission denied');
      });
      vi.mocked(fs.statSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      vi.mocked(fs.readlinkSync).mockReturnValue('../../.synapsync/agents/broken');
      vi.mocked(fs.unlinkSync).mockImplementation(() => {
        throw new Error('Cannot remove');
      });

      // Should not throw
      const removed = manager.cleanProvider('claude');

      expect(removed).toHaveLength(0);
    });
  });
});
