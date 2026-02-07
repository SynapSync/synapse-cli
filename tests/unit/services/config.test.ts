/**
 * ConfigManager Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager, ConfigValidationError } from '../../../src/services/config/manager.js';

// Mock fs module
vi.mock('fs');

describe('ConfigManager', () => {
  const testProjectRoot = '/test/project';
  const configPath = path.join(testProjectRoot, 'synapsync.config.yaml');

  const validConfigYaml = `
name: test-project
description: A test project
version: "1.0.0"
cli:
  theme: auto
  color: true
  verbose: false
storage:
  dir: .synapsync
sync:
  method: symlink
  providers:
    claude:
      enabled: true
`;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should use provided project root', () => {
      const manager = new ConfigManager(testProjectRoot);
      expect(manager.getProjectRoot()).toBe(testProjectRoot);
    });

    it('should default to process.cwd() if no root provided', () => {
      const originalCwd = process.cwd();
      vi.spyOn(process, 'cwd').mockReturnValue('/current/dir');

      const manager = new ConfigManager();
      expect(manager.getProjectRoot()).toBe('/current/dir');
    });
  });

  describe('exists', () => {
    it('should return true when config file exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const manager = new ConfigManager(testProjectRoot);
      expect(manager.exists()).toBe(true);
      expect(fs.existsSync).toHaveBeenCalledWith(configPath);
    });

    it('should return false when config file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const manager = new ConfigManager(testProjectRoot);
      expect(manager.exists()).toBe(false);
    });
  });

  describe('load', () => {
    it('should load and parse valid configuration', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(validConfigYaml);

      const manager = new ConfigManager(testProjectRoot);
      const config = manager.load();

      expect(config.version).toBe('1.0.0');
      expect(config.name).toBe('test-project');
      expect(config.sync.providers.claude?.enabled).toBe(true);
    });

    it('should throw error when config file does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const manager = new ConfigManager(testProjectRoot);
      expect(() => manager.load()).toThrow('Configuration file not found');
    });

    it('should throw ConfigValidationError for invalid config', () => {
      const invalidYaml = `
version: "1.0.0"
project:
  name: ""
`;
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(invalidYaml);

      const manager = new ConfigManager(testProjectRoot);
      expect(() => manager.load()).toThrow(ConfigValidationError);
    });
  });

  describe('save', () => {
    it('should save configuration to file', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(validConfigYaml);
      vi.mocked(fs.writeFileSync).mockImplementation(() => {});

      const manager = new ConfigManager(testProjectRoot);
      manager.load();
      manager.save();

      expect(fs.writeFileSync).toHaveBeenCalledWith(configPath, expect.any(String), 'utf-8');
    });

    it('should throw error when no config loaded', () => {
      const manager = new ConfigManager(testProjectRoot);
      expect(() => manager.save()).toThrow('No configuration to save');
    });
  });

  describe('create', () => {
    it('should create new configuration with defaults', () => {
      const manager = new ConfigManager(testProjectRoot);
      const config = manager.create('my-project', 'My description');

      expect(config.name).toBe('my-project');
      expect(config.description).toBe('My description');
      expect(config.version).toBe('1.0.0');
    });

    it('should create configuration without description', () => {
      const manager = new ConfigManager(testProjectRoot);
      const config = manager.create('my-project');

      expect(config.name).toBe('my-project');
    });
  });

  describe('getConfig', () => {
    it('should return loaded configuration', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(validConfigYaml);

      const manager = new ConfigManager(testProjectRoot);
      manager.load();

      const config = manager.getConfig();
      expect(config.name).toBe('test-project');
    });

    it('should throw error when no config loaded', () => {
      const manager = new ConfigManager(testProjectRoot);
      expect(() => manager.getConfig()).toThrow('No configuration loaded');
    });
  });

  describe('getSynapSyncDir', () => {
    it('should return synapsync directory path', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(validConfigYaml);

      const manager = new ConfigManager(testProjectRoot);
      manager.load();

      const synapSyncDir = manager.getSynapSyncDir();
      expect(synapSyncDir).toBe(path.join(testProjectRoot, '.synapsync'));
    });

    it('should handle absolute paths', () => {
      const configWithAbsolutePath = `
name: test-project
description: Test
version: "1.0.0"
storage:
  dir: /absolute/path/.synapsync
sync:
  method: symlink
  providers: {}
`;
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(configWithAbsolutePath);

      const manager = new ConfigManager(testProjectRoot);
      manager.load();

      const synapSyncDir = manager.getSynapSyncDir();
      expect(synapSyncDir).toBe('/absolute/path/.synapsync');
    });
  });

  describe('get/set values', () => {
    let manager: ConfigManager;

    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(validConfigYaml);
      manager = new ConfigManager(testProjectRoot);
      manager.load();
    });

    it('should get nested value by path', () => {
      const value = manager.get('name');
      expect(value).toBe('test-project');
    });

    it('should get deeply nested value', () => {
      const value = manager.get('cli.theme');
      expect(value).toBe('auto');
    });

    it('should return undefined for non-existent path', () => {
      const value = manager.get('non.existent.path');
      expect(value).toBeUndefined();
    });

    it('should set nested value by path', () => {
      manager.set('cli.theme', 'dark');
      expect(manager.get('cli.theme')).toBe('dark');
    });

    it('should check if key exists', () => {
      expect(manager.has('name')).toBe(true);
      expect(manager.has('non.existent')).toBe(false);
    });
  });

  describe('flatten', () => {
    it('should flatten configuration to dot-notation keys', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(validConfigYaml);

      const manager = new ConfigManager(testProjectRoot);
      manager.load();

      const flat = manager.flatten();
      expect(flat['name']).toBe('test-project');
      expect(flat['sync.providers.claude.enabled']).toBe(true);
    });
  });

  describe('static methods', () => {
    describe('findConfig', () => {
      it('should find config in current directory', () => {
        vi.mocked(fs.existsSync).mockImplementation((p: fs.PathLike) => {
          return p.toString() === path.join(testProjectRoot, 'synapsync.config.yaml');
        });
        vi.mocked(fs.readFileSync).mockReturnValue(validConfigYaml);

        const manager = ConfigManager.findConfig(testProjectRoot);
        expect(manager).not.toBeNull();
        expect(manager?.getProjectRoot()).toBe(testProjectRoot);
      });

      it('should find config in parent directory', () => {
        const childDir = path.join(testProjectRoot, 'subdir', 'nested');
        vi.mocked(fs.existsSync).mockImplementation((p: fs.PathLike) => {
          return p.toString() === path.join(testProjectRoot, 'synapsync.config.yaml');
        });
        vi.mocked(fs.readFileSync).mockReturnValue(validConfigYaml);

        const manager = ConfigManager.findConfig(childDir);
        expect(manager).not.toBeNull();
        expect(manager?.getProjectRoot()).toBe(testProjectRoot);
      });

      it('should return null when no config found', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false);

        const manager = ConfigManager.findConfig('/some/path');
        expect(manager).toBeNull();
      });
    });

    describe('isProjectInitialized', () => {
      it('should return true when both config and .synapsync exist', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true);

        const result = ConfigManager.isProjectInitialized(testProjectRoot);
        expect(result).toBe(true);
      });

      it('should return false when config does not exist', () => {
        vi.mocked(fs.existsSync).mockImplementation((p: fs.PathLike) => {
          return !p.toString().endsWith('synapsync.config.yaml');
        });

        const result = ConfigManager.isProjectInitialized(testProjectRoot);
        expect(result).toBe(false);
      });

      it('should return false when .synapsync does not exist', () => {
        vi.mocked(fs.existsSync).mockImplementation((p: fs.PathLike) => {
          return !p.toString().endsWith('.synapsync');
        });

        const result = ConfigManager.isProjectInitialized(testProjectRoot);
        expect(result).toBe(false);
      });
    });
  });
});
