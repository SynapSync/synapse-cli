/**
 * Declarative argument parser for REPL commands
 */

import type { FlagDef, ParsedArgs } from './types.js';

export function parseArgs(argsString: string, flagDefs: FlagDef[]): ParsedArgs {
  const parts = argsString.split(/\s+/);
  const positional: string[] = [];
  const options: Record<string, string | boolean> = {};

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === undefined || part === '') continue;

    const flagDef = flagDefs.find((f) => f.flags.includes(part));
    if (flagDef) {
      if (flagDef.type === 'boolean') {
        options[flagDef.key] = true;
      } else {
        options[flagDef.key] = parts[++i] ?? '';
      }
    } else if (!part.startsWith('-')) {
      positional.push(part);
    }
  }

  return { positional, options };
}
