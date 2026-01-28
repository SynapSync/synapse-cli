/**
 * SynapSync CLI - Entry Point
 *
 * Neural AI Orchestration Platform
 * Manage AI skills across multiple providers
 */

import { runCLI } from './cli.js';

// Run the CLI
runCLI().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
