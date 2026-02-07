/**
 * Banner UI Tests
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
    info: vi.fn(),
    dim: vi.fn(),
    command: vi.fn(),
    header: vi.fn(),
    gradient: vi.fn(),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

vi.mock('../../../src/version.js', () => ({
  version: '1.0.0',
}));

import {
  showBanner,
  showHeader,
  showSuccess,
  showError,
  showWarning,
  showInfo,
} from '../../../src/ui/banner.js';

describe('showBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show the logo and version', () => {
    showBanner();

    expect(mockLogger.dim).toHaveBeenCalledWith(expect.stringContaining('Version'));
    expect(mockLogger.bold).toHaveBeenCalledWith(expect.stringContaining('Quick Start'));
  });

  it('should show quick start commands', () => {
    showBanner();

    expect(mockLogger.command).toHaveBeenCalledWith('synapsync init', expect.any(String));
    expect(mockLogger.command).toHaveBeenCalledWith('synapsync add <name>', expect.any(String));
    expect(mockLogger.command).toHaveBeenCalledWith('synapsync sync', expect.any(String));
  });
});

describe('showHeader', () => {
  it('should delegate to logger.header', () => {
    showHeader('Test Title');
    expect(mockLogger.header).toHaveBeenCalledWith('Test Title');
  });
});

describe('showSuccess', () => {
  it('should delegate to logger.success', () => {
    showSuccess('Done!');
    expect(mockLogger.success).toHaveBeenCalledWith('Done!');
  });
});

describe('showError', () => {
  it('should delegate to logger.error', () => {
    showError('Failed!');
    expect(mockLogger.error).toHaveBeenCalledWith('Failed!');
  });
});

describe('showWarning', () => {
  it('should delegate to logger.warning', () => {
    showWarning('Careful!');
    expect(mockLogger.warning).toHaveBeenCalledWith('Careful!');
  });
});

describe('showInfo', () => {
  it('should delegate to logger.info', () => {
    showInfo('FYI');
    expect(mockLogger.info).toHaveBeenCalledWith('FYI');
  });
});
