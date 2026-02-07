/**
 * Command registry for the interactive REPL
 */

import type { CommandDef } from './types.js';

export const COMMANDS: Record<string, CommandDef> = {};

export function registerInteractiveCommand(
  name: string,
  description: string,
  handler: (args: string) => void | Promise<void>,
  options?: {
    usage?: string;
    options?: Array<{ flag: string; description: string }>;
    examples?: string[];
  }
): void {
  const def: CommandDef = { description, handler };
  if (options?.usage !== undefined) def.usage = options.usage;
  if (options?.options !== undefined) def.options = options.options;
  if (options?.examples !== undefined) def.examples = options.examples;
  COMMANDS[name] = def;
}
