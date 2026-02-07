/**
 * Logo UI Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

const { mockLogger } = vi.hoisted(() => ({
  mockLogger: {
    log: vi.fn(),
    line: vi.fn(),
    gradient: vi.fn(),
  },
}));

vi.mock('../../../src/utils/logger.js', () => ({
  logger: mockLogger,
}));

import { showLogo, getLogoLines } from '../../../src/ui/logo.js';

describe('showLogo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show full logo on wide terminals', () => {
    // Mock wide terminal
    Object.defineProperty(process.stdout, 'columns', { value: 120, configurable: true });

    showLogo();

    expect(mockLogger.line).toHaveBeenCalled();
    expect(mockLogger.gradient).toHaveBeenCalled();
    // Full logo has 6 lines
    expect(mockLogger.gradient).toHaveBeenCalledTimes(6);
  });

  it('should show compact logo on narrow terminals', () => {
    // Mock narrow terminal
    Object.defineProperty(process.stdout, 'columns', { value: 60, configurable: true });

    showLogo();

    expect(mockLogger.gradient).toHaveBeenCalled();
    // Compact logo has 3 lines
    expect(mockLogger.gradient).toHaveBeenCalledTimes(3);
  });
});

describe('getLogoLines', () => {
  it('should return array of colored logo lines for wide terminal', () => {
    Object.defineProperty(process.stdout, 'columns', { value: 120, configurable: true });

    const lines = getLogoLines();

    expect(lines).toBeInstanceOf(Array);
    expect(lines.length).toBe(6);
    // Each line should contain ANSI color codes
    expect(lines[0]).toContain('\x1b[');
  });

  it('should return compact logo lines for narrow terminal', () => {
    Object.defineProperty(process.stdout, 'columns', { value: 60, configurable: true });

    const lines = getLogoLines();

    expect(lines).toBeInstanceOf(Array);
    expect(lines.length).toBe(3);
  });
});
