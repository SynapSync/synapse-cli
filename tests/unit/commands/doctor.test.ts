/**
 * Doctor Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockFindConfig, mockDiagnose, mockFix, mockLogger } = vi.hoisted(() => ({
  mockFindConfig: vi.fn(),
  mockDiagnose: vi.fn(),
  mockFix: vi.fn(),
  mockLogger: {
    log: vi.fn(),
    line: vi.fn(),
    error: vi.fn(),
    hint: vi.fn(),
    bold: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('../../../src/services/config/manager.js', () => ({
  ConfigManager: {
    findConfig: (...args: unknown[]) => mockFindConfig(...args),
  },
}));

vi.mock('../../../src/services/maintenance/doctor.js', () => ({
  DoctorService: vi.fn().mockImplementation(function () {
    return { diagnose: mockDiagnose, fix: mockFix };
  }),
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

import { executeDoctorCommand } from '../../../src/commands/doctor.js';

vi.spyOn(console, 'log').mockImplementation(() => undefined);

const mockConfigManager = {
  getSynapSyncDir: vi.fn().mockReturnValue('/project/.synapsync'),
  getProjectRoot: vi.fn().mockReturnValue('/project'),
  getConfig: vi.fn().mockReturnValue({
    name: 'test',
    version: '1.0.0',
    cli: { theme: 'auto', color: true, verbose: false },
    storage: { dir: '.synapsync' },
    sync: { method: 'symlink', providers: {} },
  }),
};

const healthyResult = {
  healthy: true,
  checks: [{ id: 'synapsync-dir', name: 'SynapSync directory', status: 'pass', message: 'OK' }],
  passed: 1,
  failed: 0,
  warnings: 0,
  duration: 5,
};

describe('executeDoctorCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when project is not initialized', async () => {
    mockFindConfig.mockReturnValue(null);

    await executeDoctorCommand();

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('No SynapSync project'));
  });

  it('should run diagnostics and show healthy status', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockDiagnose.mockResolvedValue(healthyResult);

    await executeDoctorCommand();

    expect(mockDiagnose).toHaveBeenCalled();
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('healthy'));
  });

  it('should show issue count when problems found', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockDiagnose.mockResolvedValue({
      healthy: false,
      checks: [{ id: 'test', name: 'Test check', status: 'fail', message: 'Failed' }],
      passed: 0,
      failed: 1,
      warnings: 0,
      duration: 3,
    });

    await executeDoctorCommand();

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('1 issue'));
  });

  it('should show warning count', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockDiagnose.mockResolvedValue({
      healthy: false,
      checks: [{ id: 'test', name: 'Test check', status: 'warn', message: 'Warning' }],
      passed: 0,
      failed: 0,
      warnings: 1,
      duration: 3,
    });

    await executeDoctorCommand();

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('1 warning'));
  });

  it('should run fixes when --fix option is set', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockDiagnose.mockResolvedValue({
      healthy: false,
      checks: [{ id: 'test', name: 'Test', status: 'fail', message: 'Failed' }],
      passed: 0,
      failed: 1,
      warnings: 0,
      duration: 3,
    });
    mockFix.mockResolvedValue({ fixed: ['test'], failed: [] });

    await executeDoctorCommand({ fix: true });

    expect(mockFix).toHaveBeenCalled();
  });

  it('should not run fixes when project is healthy', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockDiagnose.mockResolvedValue(healthyResult);

    await executeDoctorCommand({ fix: true });

    expect(mockFix).not.toHaveBeenCalled();
  });

  it('should pass check filters', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockDiagnose.mockResolvedValue(healthyResult);

    await executeDoctorCommand({ check: ['synapsync-dir'] });

    expect(mockDiagnose).toHaveBeenCalledWith(
      expect.objectContaining({ checks: ['synapsync-dir'] })
    );
  });

  it('should output JSON when requested', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockDiagnose.mockResolvedValue(healthyResult);

    await executeDoctorCommand({ json: true });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('"diagnostics"'));
  });

  it('should show fix hint when issues found without --fix', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockDiagnose.mockResolvedValue({
      healthy: false,
      checks: [{ id: 'test', name: 'Test', status: 'fail', message: 'Failed' }],
      passed: 0,
      failed: 1,
      warnings: 0,
      duration: 3,
    });

    await executeDoctorCommand();

    expect(mockLogger.hint).toHaveBeenCalledWith(expect.stringContaining('--fix'));
  });

  it('should handle config read errors gracefully', async () => {
    const manager = {
      ...mockConfigManager,
      getConfig: vi.fn().mockImplementation(() => {
        throw new Error('Config broken');
      }),
    };
    mockFindConfig.mockReturnValue(manager);
    mockDiagnose.mockResolvedValue(healthyResult);

    await executeDoctorCommand();

    expect(mockDiagnose).toHaveBeenCalled();
  });

  it('should display check details for failures', async () => {
    mockFindConfig.mockReturnValue(mockConfigManager);
    mockDiagnose.mockResolvedValue({
      healthy: false,
      checks: [
        {
          id: 'test',
          name: 'Test check',
          status: 'fail',
          message: 'Something is wrong',
          details: ['detail 1', 'detail 2'],
        },
      ],
      passed: 0,
      failed: 1,
      warnings: 0,
      duration: 3,
    });

    await executeDoctorCommand({ verbose: true });

    expect(mockDiagnose).toHaveBeenCalledWith(expect.objectContaining({ verbose: true }));
  });
});
