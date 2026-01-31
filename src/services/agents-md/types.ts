/**
 * AGENTS.md Generator Types
 *
 * Type definitions for the AGENTS.md generation service
 */

import type { CognitiveType, Category } from '../../core/constants.js';

/**
 * A cognitive entry enriched with description for AGENTS.md rendering
 */
export interface AgentsMdEntry {
  name: string;
  type: CognitiveType;
  category: Category;
  description: string;
  version: string;
  /** Relative path from project root to the cognitive's main file */
  relativePath: string;
  /** The display filename for the link */
  fileName: string;
}

/**
 * Result of AGENTS.md generation
 */
export interface AgentsMdResult {
  success: boolean;
  filePath: string;
  cognitiveCount: number;
  error?: string;
}
