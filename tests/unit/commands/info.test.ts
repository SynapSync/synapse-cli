/**
 * Info Command Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockLogger } = vi.hoisted(() => ({
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
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

import { executeInfoCommand } from '../../../src/commands/info.js';

describe('executeInfoCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show all topics when no args', () => {
    executeInfoCommand('');

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('SynapSync Info'));
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('--cognitives'));
  });

  it('should show cognitives info with --cognitives flag', () => {
    executeInfoCommand('--cognitives');

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Cognitive Types'));
  });

  it('should show add info with --add flag', () => {
    executeInfoCommand('--add');

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Installation Sources'));
  });

  it('should show providers info with --providers flag', () => {
    executeInfoCommand('--providers');

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Supported Providers'));
  });

  it('should show categories info with --categories flag', () => {
    executeInfoCommand('--categories');

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Cognitive Categories'));
  });

  it('should show sync info with --sync flag', () => {
    executeInfoCommand('--sync');

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Synchronization'));
  });

  it('should show structure info with --structure flag', () => {
    executeInfoCommand('--structure');

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Project Structure'));
  });

  it('should accept topic name without dashes', () => {
    executeInfoCommand('cognitives');

    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('Cognitive Types'));
  });

  it('should show error for unknown topic', () => {
    executeInfoCommand('--nonexistent');

    expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('Unknown topic'));
  });

  it('should show all topics after unknown topic error', () => {
    executeInfoCommand('--nonexistent');

    // After error, should show the topic list
    expect(mockLogger.log).toHaveBeenCalledWith(expect.stringContaining('--cognitives'));
  });
});
