/**
 * Color utilities and presets for consistent styling
 */

import pc from 'picocolors';

// Reset code
export const RESET = '\x1b[0m';

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

  // Asset type colors
  assetType: {
    skill: '\x1b[38;5;39m', // Blue
    agent: '\x1b[38;5;208m', // Orange
    prompt: '\x1b[38;5;135m', // Purple
    workflow: '\x1b[38;5;46m', // Green
    tool: '\x1b[38;5;220m', // Yellow
  } as Record<string, string>,

  // Category colors for organization
  category: {
    frontend: '\x1b[38;5;214m', // Orange
    backend: '\x1b[38;5;39m', // Blue
    database: '\x1b[38;5;208m', // Dark orange
    devops: '\x1b[38;5;135m', // Purple
    security: '\x1b[38;5;196m', // Red
    testing: '\x1b[38;5;220m', // Yellow
    analytics: '\x1b[38;5;51m', // Cyan
    automation: '\x1b[38;5;46m', // Bright green
    general: '\x1b[38;5;252m', // Light gray
  } as Record<string, string>,

  // Provider colors
  provider: {
    claude: '\x1b[38;5;208m', // Orange (Anthropic)
    openai: '\x1b[38;5;46m', // Green (OpenAI)
    gemini: '\x1b[38;5;39m', // Blue (Google)
    cursor: '\x1b[38;5;135m', // Purple
    windsurf: '\x1b[38;5;51m', // Cyan
    copilot: '\x1b[38;5;255m', // White (GitHub)
  } as Record<string, string>,
};

/**
 * Apply asset type color to text
 */
export function colorAssetType(type: string, text: string): string {
  const defaultColor = colors.assetType['skill'] ?? '';
  const color = colors.assetType[type] ?? defaultColor;
  return `${color}${text}${RESET}`;
}

/**
 * Apply category color to text
 */
export function colorCategory(category: string, text: string): string {
  const defaultColor = colors.category['general'] ?? '';
  const color = colors.category[category] ?? defaultColor;
  return `${color}${text}${RESET}`;
}

/**
 * Apply provider color to text
 */
export function colorProvider(provider: string, text: string): string {
  const color = colors.provider[provider];
  if (color) {
    return `${color}${text}${RESET}`;
  }
  return pc.white(text);
}

/**
 * Create a colored status indicator
 */
export function statusIndicator(
  status: 'connected' | 'disconnected' | 'error' | 'pending'
): string {
  switch (status) {
    case 'connected':
      return pc.green('●');
    case 'disconnected':
      return pc.dim('○');
    case 'error':
      return pc.red('●');
    case 'pending':
      return pc.yellow('◐');
    default:
      return pc.dim('○');
  }
}
