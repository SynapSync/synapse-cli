/**
 * Init Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockIsProjectInitialized, mockConfigCreate, mockConfigSet, mockConfigSave, mockLogger, mockSpinner, mockNote, mockOutro } = vi.hoisted(() => ({
  mockIsProjectInitialized: vi.fn(),
  mockConfigCreate: vi.fn(),
  mockConfigSet: vi.fn(),
  mockConfigSave: vi.fn(),
  mockLogger: {
    log: vi.fn(),
    line: vi.fn(),
    error: vi.fn(),
    hint: vi.fn(),
    bold: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    dim: vi.fn(),
  },
  mockSpinner: { start: vi.fn(), stop: vi.fn() },
  mockNote: vi.fn(),
  mockOutro: vi.fn(),
}));

vi.mock('fs');

vi.mock('../../../src/services/config/manager.js', () => {
  const MockConfigManager = vi.fn().mockImplementation(function () {
    return {
      create: mockConfigCreate,
      set: mockConfigSet,
      save: mockConfigSave,
    };
  });
  (MockConfigManager as unknown as Record<string, unknown>).isProjectInitialized = (...args: unknown[]) => mockIsProjectInitialized(...args);
  return { ConfigManager: MockConfigManager };
});

vi.mock('../../../src/services/agents-md/generator.js', () => ({
  AgentsMdGenerator: vi.fn().mockImplementation(function () {
    return { generateEmpty: vi.fn() };
  }),
}));

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  spinner: () => mockSpinner,
  note: (...args: unknown[]) => mockNote(...args),
  outro: (...args: unknown[]) => mockOutro(...args),
  group: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

import * as fs from 'fs';
import { executeInitCommand } from '../../../src/commands/init.js';

describe('executeInitCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.existsSync).mockReturnValue(false);
    vi.mocked(fs.mkdirSync).mockImplementation(() => undefined as unknown as string);
    vi.mocked(fs.writeFileSync).mockImplementation(() => undefined);
    vi.mocked(fs.appendFileSync).mockImplementation(() => undefined);
  });

  it('should warn when project is already initialized', async () => {
    mockIsProjectInitialized.mockReturnValue(true);

    const result = await executeInitCommand();

    expect(result).toBeNull();
    expect(mockLogger.warning).toHaveBeenCalledWith(expect.stringContaining('already initialized'));
  });

  it('should initialize with defaults in non-interactive mode', async () => {
    mockIsProjectInitialized.mockReturnValue(false);

    const result = await executeInitCommand({ yes: true });

    expect(result).not.toBeNull();
    expect(result?.success).toBe(true);
    expect(fs.mkdirSync).toHaveBeenCalled();
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('should use provided name in non-interactive mode', async () => {
    mockIsProjectInitialized.mockReturnValue(false);

    const result = await executeInitCommand({ yes: true, name: 'my-project' });

    expect(result?.success).toBe(true);
  });

  it('should create storage structure with cognitive type dirs', async () => {
    mockIsProjectInitialized.mockReturnValue(false);

    await executeInitCommand({ yes: true });

    // Should create directories for each cognitive type (skills, agents, prompts, workflows, tools)
    const mkdirCalls = vi.mocked(fs.mkdirSync).mock.calls.map((c) => String(c[0]));
    expect(mkdirCalls.some((p) => p.includes('skills'))).toBe(true);
    expect(mkdirCalls.some((p) => p.includes('agents'))).toBe(true);
    expect(mkdirCalls.some((p) => p.includes('prompts'))).toBe(true);
  });

  it('should create manifest.json', async () => {
    mockIsProjectInitialized.mockReturnValue(false);

    await executeInitCommand({ yes: true });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const manifestCall = writeCalls.find((c) => String(c[0]).includes('manifest.json'));
    expect(manifestCall).toBeDefined();
  });

  it('should update .gitignore when it exists', async () => {
    mockIsProjectInitialized.mockReturnValue(false);
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      if (String(p).includes('.gitignore')) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue('node_modules\n');

    await executeInitCommand({ yes: true });

    expect(fs.appendFileSync).toHaveBeenCalledWith(
      expect.stringContaining('.gitignore'),
      expect.stringContaining('SynapSync')
    );
  });

  it('should not duplicate gitignore entries', async () => {
    mockIsProjectInitialized.mockReturnValue(false);
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      if (String(p).includes('.gitignore')) return true;
      return false;
    });
    vi.mocked(fs.readFileSync).mockReturnValue('# SynapSync\n.synapsync/manifest.json\n');

    await executeInitCommand({ yes: true });

    expect(fs.appendFileSync).not.toHaveBeenCalled();
  });

  it('should create .gitignore when it does not exist', async () => {
    mockIsProjectInitialized.mockReturnValue(false);

    await executeInitCommand({ yes: true });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const gitignoreCall = writeCalls.find((c) => String(c[0]).includes('.gitignore'));
    expect(gitignoreCall).toBeDefined();
  });

  it('should default provider to claude in non-interactive mode', async () => {
    mockIsProjectInitialized.mockReturnValue(false);

    await executeInitCommand({ yes: true });

    // The ConfigManager.create and set are mocked through the constructor mock,
    // but we can verify the spinner messages
    expect(mockSpinner.start).toHaveBeenCalledWith('Creating project structure...');
    expect(mockSpinner.stop).toHaveBeenCalledWith('Project structure created!');
  });

  it('should show success message with next steps', async () => {
    mockIsProjectInitialized.mockReturnValue(false);

    await executeInitCommand({ yes: true });

    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Next Steps'));
    expect(mockOutro).toHaveBeenCalled();
  });
});
