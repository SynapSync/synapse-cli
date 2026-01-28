/**
 * SynapSync CLI - Entry point
 */

import { runCLI } from './cli.js';
import { logger } from './utils/logger.js';

runCLI().catch((error) => {
  logger.error(`Fatal error: ${error}`);
  process.exit(1);
});
