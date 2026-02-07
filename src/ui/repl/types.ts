/**
 * REPL type definitions
 */

export interface CommandDef {
  description: string;
  usage?: string;
  options?: Array<{ flag: string; description: string }>;
  examples?: string[];
  handler: (args: string) => void | Promise<void>;
}

export interface FlagDef {
  flags: string[];
  key: string;
  type: 'string' | 'boolean';
}

export interface ParsedArgs {
  positional: string[];
  options: Record<string, string | boolean>;
}
