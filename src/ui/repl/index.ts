/**
 * REPL module barrel
 *
 * Side-effect imports register commands before exports are used.
 */

import './help.js';
import './commands.js';

export { startInteractiveMode } from './loop.js';
export { registerInteractiveCommand, COMMANDS } from './registry.js';
export { parseArgs } from './arg-parser.js';
export type { CommandDef, FlagDef, ParsedArgs } from './types.js';
