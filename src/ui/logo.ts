/**
 * ASCII Logo with gradient colors
 * Inspired by vercel-labs/skills pattern
 */

import { RESET } from '../core/constants.js';

// SynapSync ASCII art logo
const LOGO_LINES = [
  '███████╗██╗   ██╗███╗   ██╗ █████╗ ██████╗ ███████╗██╗   ██╗███╗   ██╗ ██████╗',
  '██╔════╝╚██╗ ██╔╝████╗  ██║██╔══██╗██╔══██╗██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝',
  '███████╗ ╚████╔╝ ██╔██╗ ██║███████║██████╔╝███████╗ ╚████╔╝ ██╔██╗ ██║██║     ',
  '╚════██║  ╚██╔╝  ██║╚██╗██║██╔══██║██╔═══╝ ╚════██║  ╚██╔╝  ██║╚██╗██║██║     ',
  '███████║   ██║   ██║ ╚████║██║  ██║██║     ███████║   ██║   ██║ ╚████║╚██████╗',
  '╚══════╝   ╚═╝   ╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝     ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝',
];

// Gradient colors: Blue -> Cyan -> Green
const GRADIENT_COLORS = [
  '\x1b[38;5;39m', // Bright blue
  '\x1b[38;5;38m', // Blue-cyan
  '\x1b[38;5;37m', // Cyan
  '\x1b[38;5;36m', // Cyan-green
  '\x1b[38;5;35m', // Green-cyan
  '\x1b[38;5;34m', // Green
];

// Alternative compact logo for smaller terminals
const COMPACT_LOGO_LINES = [
  '╔═╗┬ ┬┌┐┌┌─┐┌─┐╔═╗┬ ┬┌┐┌┌─┐',
  '╚═╗└┬┘│││├─┤├─┘╚═╗└┬┘││││  ',
  '╚═╝ ┴ ┘└┘┴ ┴┴  ╚═╝ ┴ ┘└┘└─┘',
];

const COMPACT_COLORS = [
  '\x1b[38;5;39m',
  '\x1b[38;5;37m',
  '\x1b[38;5;34m',
];

/**
 * Get terminal width, defaulting to 80 if unavailable
 */
function getTerminalWidth(): number {
  return process.stdout.columns ?? 80;
}

/**
 * Show the full ASCII logo with gradient
 */
export function showLogo(): void {
  const termWidth = getTerminalWidth();
  const useCompact = termWidth < 85;

  console.log();

  if (useCompact) {
    COMPACT_LOGO_LINES.forEach((line, index) => {
      const color = COMPACT_COLORS[index % COMPACT_COLORS.length];
      console.log(`${color}${line}${RESET}`);
    });
  } else {
    LOGO_LINES.forEach((line, index) => {
      const color = GRADIENT_COLORS[index % GRADIENT_COLORS.length];
      console.log(`${color}${line}${RESET}`);
    });
  }
}

/**
 * Get logo as string array (for custom rendering)
 */
export function getLogoLines(): string[] {
  const termWidth = getTerminalWidth();
  const useCompact = termWidth < 85;
  const lines = useCompact ? COMPACT_LOGO_LINES : LOGO_LINES;
  const colors = useCompact ? COMPACT_COLORS : GRADIENT_COLORS;

  return lines.map((line, index) => {
    const color = colors[index % colors.length];
    return `${color}${line}${RESET}`;
  });
}
