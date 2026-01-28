/**
 * Color utilities and presets for consistent styling
 */

import pc from 'picocolors';

// Semantic colors for different UI elements
export const colors = {
  // Status colors
  success: pc.green,
  error: pc.red,
  warning: pc.yellow,
  info: pc.blue,

  // UI elements
  primary: pc.cyan,
  secondary: pc.magenta,
  muted: pc.dim,
  bold: pc.bold,

  // Specific elements
  command: pc.cyan,
  flag: pc.yellow,
  value: pc.green,
  path: pc.underline,
  url: pc.blue,

  // Department colors for skills
  department: {
    frontend: '\x1b[38;5;214m', // Orange
    backend: '\x1b[38;5;39m', // Blue
    database: '\x1b[38;5;208m', // Dark orange
    devops: '\x1b[38;5;135m', // Purple
    security: '\x1b[38;5;196m', // Red
    growth: '\x1b[38;5;46m', // Bright green
    testing: '\x1b[38;5;220m', // Yellow
    general: '\x1b[38;5;252m', // Light gray
  } as Record<string, string>,

  // Provider colors
  provider: {
    claude: '\x1b[38;5;208m', // Orange (Anthropic)
    openai: '\x1b[38;5;46m', // Green (OpenAI)
    gemini: '\x1b[38;5;39m', // Blue (Google)
    codex: '\x1b[38;5;46m', // Green (OpenAI)
    cursor: '\x1b[38;5;135m', // Purple
  } as Record<string, string>,
};

// Reset code
export const RESET = '\x1b[0m';

/**
 * Apply department color to text
 */
export function colorDepartment(department: string, text: string): string {
  const color = colors.department[department] ?? colors.department['general'];
  return `${color}${text}${RESET}`;
}

/**
 * Apply provider color to text
 */
export function colorProvider(provider: string, text: string): string {
  const color = colors.provider[provider] ?? pc.white(text);
  if (typeof color === 'string') {
    return `${color}${text}${RESET}`;
  }
  return color;
}

/**
 * Create a colored status indicator
 */
export function statusIndicator(status: 'active' | 'inactive' | 'error' | 'pending'): string {
  switch (status) {
    case 'active':
      return pc.green('●');
    case 'inactive':
      return pc.dim('○');
    case 'error':
      return pc.red('●');
    case 'pending':
      return pc.yellow('◐');
    default:
      return pc.dim('○');
  }
}
