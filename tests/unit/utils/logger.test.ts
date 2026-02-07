/**
 * Logger Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger } from '../../../src/utils/logger.js';

// Spy on console methods
const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
const clearSpy = vi.spyOn(console, 'clear').mockImplementation(() => undefined);

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env['DEBUG'];
  });

  describe('log', () => {
    it('should log a message', () => {
      logger.log('hello');
      expect(logSpy).toHaveBeenCalledWith('hello');
    });

    it('should log empty string by default', () => {
      logger.log();
      expect(logSpy).toHaveBeenCalledWith('');
    });
  });

  describe('line', () => {
    it('should print an empty line', () => {
      logger.line();
      expect(logSpy).toHaveBeenCalledWith();
    });
  });

  describe('clear', () => {
    it('should clear the console', () => {
      logger.clear();
      expect(clearSpy).toHaveBeenCalled();
    });
  });

  describe('info', () => {
    it('should log info message with icon', () => {
      logger.info('test info');
      expect(logSpy).toHaveBeenCalledOnce();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain('test info');
    });
  });

  describe('success', () => {
    it('should log success message with icon', () => {
      logger.success('done!');
      expect(logSpy).toHaveBeenCalledOnce();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain('done!');
    });
  });

  describe('warning', () => {
    it('should log warning message with icon', () => {
      logger.warning('be careful');
      expect(logSpy).toHaveBeenCalledOnce();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain('be careful');
    });
  });

  describe('error', () => {
    it('should log error to stderr with icon', () => {
      logger.error('something failed');
      expect(errorSpy).toHaveBeenCalledOnce();
      const output = errorSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain('something failed');
    });
  });

  describe('debug', () => {
    it('should not log when DEBUG is not set', () => {
      logger.debug('hidden');
      expect(logSpy).not.toHaveBeenCalled();
    });

    it('should log when DEBUG is set', () => {
      process.env['DEBUG'] = '1';
      logger.debug('visible');
      expect(logSpy).toHaveBeenCalledOnce();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain('visible');
    });
  });

  describe('bold', () => {
    it('should log bold text', () => {
      logger.bold('strong');
      expect(logSpy).toHaveBeenCalledOnce();
    });
  });

  describe('dim', () => {
    it('should log dim text', () => {
      logger.dim('subtle');
      expect(logSpy).toHaveBeenCalledOnce();
    });
  });

  describe('section', () => {
    it('should log section title with spacing', () => {
      logger.section('My Section');
      // section prints empty line then the title
      expect(logSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('header', () => {
    it('should log header with underline', () => {
      logger.header('My Header');
      // header prints: empty line, title, underline, empty line
      expect(logSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('list', () => {
    it('should log bullet list items', () => {
      logger.list(['item 1', 'item 2', 'item 3']);
      expect(logSpy).toHaveBeenCalledTimes(3);
    });

    it('should handle empty list', () => {
      logger.list([]);
      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  describe('label', () => {
    it('should log key-value pair', () => {
      logger.label('Version', '1.0.0');
      expect(logSpy).toHaveBeenCalledOnce();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain('1.0.0');
    });
  });

  describe('hint', () => {
    it('should log hint text', () => {
      logger.hint('try this command');
      expect(logSpy).toHaveBeenCalledOnce();
    });
  });

  describe('command', () => {
    it('should log command with description', () => {
      logger.command('synapsync add', 'Add a cognitive');
      expect(logSpy).toHaveBeenCalledOnce();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain('synapsync add');
    });
  });

  describe('gradient', () => {
    it('should log colored line with reset', () => {
      logger.gradient('colored text', '\x1b[36m');
      expect(logSpy).toHaveBeenCalledOnce();
      const output = logSpy.mock.calls[0]?.[0] as string;
      expect(output).toContain('colored text');
      expect(output).toContain('\x1b[0m');
    });
  });

  describe('spinner', () => {
    it('should create and start a spinner', () => {
      const spinner = logger.spinner('Loading...');
      expect(spinner).toBeDefined();
      expect(spinner.stop).toBeDefined();
      spinner.stop();
    });
  });
});
