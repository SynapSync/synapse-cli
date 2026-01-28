/**
 * Logger utility for consistent CLI output
 * Centralizes all console output with styling via picocolors
 */

import pc from 'picocolors';
import ora, { type Ora } from 'ora';

export interface Logger {
  // Basic output
  log(message?: string): void;
  line(): void;
  clear(): void;

  // Status messages with icons
  info(message: string): void;
  success(message: string): void;
  warning(message: string): void;
  error(message: string): void;
  debug(message: string): void;

  // Formatted output
  bold(message: string): void;
  dim(message: string): void;
  section(title: string): void;
  header(title: string): void;
  list(items: string[]): void;

  // Utility output
  label(key: string, value: string): void;
  hint(message: string): void;
  command(cmd: string, description: string): void;
  gradient(line: string, color: string): void;

  // Spinner
  spinner(text: string): Ora;
}

export const logger: Logger = {
  /**
   * Log raw message
   */
  log(message = ''): void {
    console.log(message);
  },

  /**
   * Print empty line
   */
  line(): void {
    console.log();
  },

  /**
   * Clear console
   */
  clear(): void {
    console.clear();
  },

  /**
   * Info message with icon
   */
  info(message: string): void {
    console.log(`${pc.blue('ℹ')} ${message}`);
  },

  /**
   * Success message with icon
   */
  success(message: string): void {
    console.log(`${pc.green('✓')} ${message}`);
  },

  /**
   * Warning message with icon
   */
  warning(message: string): void {
    console.log(`${pc.yellow('⚠')} ${message}`);
  },

  /**
   * Error message with icon
   */
  error(message: string): void {
    console.error(`${pc.red('✖')} ${message}`);
  },

  /**
   * Debug message (only if DEBUG env is set)
   */
  debug(message: string): void {
    if (process.env['DEBUG']) {
      console.log(`${pc.dim('⋯')} ${pc.dim(message)}`);
    }
  },

  /**
   * Bold text
   */
  bold(message: string): void {
    console.log(pc.bold(message));
  },

  /**
   * Dim text
   */
  dim(message: string): void {
    console.log(pc.dim(message));
  },

  /**
   * Section title (bold cyan)
   */
  section(title: string): void {
    console.log();
    console.log(pc.bold(pc.cyan(title)));
  },

  /**
   * Header with underline
   */
  header(title: string): void {
    console.log();
    console.log(pc.bold(pc.cyan(`  ${title}`)));
    console.log(pc.dim('  ' + '─'.repeat(title.length + 2)));
    console.log();
  },

  /**
   * Bullet list
   */
  list(items: string[]): void {
    items.forEach((item) => console.log(`${pc.dim('  •')} ${item}`));
  },

  /**
   * Label: value format (for version info, etc.)
   */
  label(key: string, value: string): void {
    console.log(`${pc.dim(`${key}:`)}${' '.repeat(Math.max(1, 10 - key.length))}${value}`);
  },

  /**
   * Hint text (dim)
   */
  hint(message: string): void {
    console.log(pc.dim(message));
  },

  /**
   * Command display with description
   */
  command(cmd: string, description: string): void {
    console.log(`  ${pc.dim('$')} ${pc.white(cmd)}  ${pc.dim(description)}`);
  },

  /**
   * Gradient line (for logo)
   */
  gradient(line: string, color: string): void {
    const RESET = '\x1b[0m';
    console.log(`${color}${line}${RESET}`);
  },

  /**
   * Create and start a spinner
   */
  spinner(text: string): Ora {
    return ora(text).start();
  },
};

export default logger;
