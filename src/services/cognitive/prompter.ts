/**
 * Cognitive Type Prompter
 *
 * Interactive prompts for when cognitive type cannot be auto-detected
 */

import * as readline from 'readline';
import pc from 'picocolors';
import { COGNITIVE_TYPES, COGNITIVE_FILE_NAMES } from '../../core/constants.js';
import type { CognitiveType } from '../../core/constants.js';
import { logger } from '../../utils/logger.js';

/**
 * Cognitive type display info for prompts
 */
const COGNITIVE_TYPE_INFO: Record<CognitiveType, { label: string; description: string }> = {
  skill: {
    label: 'Skill',
    description: 'Reusable instruction sets for AI assistants',
  },
  agent: {
    label: 'Agent',
    description: 'Autonomous AI entities with specific behaviors',
  },
  prompt: {
    label: 'Prompt',
    description: 'Reusable prompt templates with variables',
  },
  workflow: {
    label: 'Workflow',
    description: 'Multi-step processes combining agents and prompts',
  },
  tool: {
    label: 'Tool',
    description: 'External integrations and functions',
  },
};

/**
 * Prompt user to select cognitive type interactively
 */
export async function promptForCognitiveType(cognitiveName: string): Promise<CognitiveType> {
  logger.line();
  logger.warning(`Could not detect cognitive type for: ${pc.cyan(cognitiveName)}`);
  logger.line();
  logger.log(pc.bold('  What type of cognitive is this?'));
  logger.line();

  // Display options
  COGNITIVE_TYPES.forEach((type, index) => {
    const info = COGNITIVE_TYPE_INFO[type];
    const num = pc.cyan(`  ${index + 1}.`);
    const label = pc.white(info.label.padEnd(10));
    const file = pc.dim(`(${COGNITIVE_FILE_NAMES[type]})`);
    const desc = pc.dim(` - ${info.description}`);
    logger.log(`${num} ${label} ${file}${desc}`);
  });

  logger.line();

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const prompt = (): void => {
      rl.question(`${pc.dim('  Select type')} ${pc.cyan('[1-5]')}: `, (answer) => {
        const num = parseInt(answer.trim(), 10);

        if (num >= 1 && num <= COGNITIVE_TYPES.length) {
          const selectedType = COGNITIVE_TYPES[num - 1];
          if (selectedType) {
            rl.close();
            logger.line();
            logger.success(`Selected: ${COGNITIVE_TYPE_INFO[selectedType].label}`);
            resolve(selectedType);
            return;
          }
        }

        // Invalid input, prompt again
        logger.error('Invalid selection. Please enter a number between 1 and 5.');
        prompt();
      });
    };

    prompt();
  });
}

/**
 * Display detection result to user
 */
export function showDetectionResult(
  cognitiveName: string,
  type: CognitiveType,
  method: string
): void {
  const info = COGNITIVE_TYPE_INFO[type];
  const methodLabels: Record<string, string> = {
    flag: 'specified via --type flag',
    registry: 'found in registry',
    file: 'detected from file',
    prompt: 'selected by user',
  };

  const methodLabel = methodLabels[method] ?? method;

  logger.line();
  logger.info(`Cognitive: ${pc.cyan(cognitiveName)}`);
  logger.log(`  ${pc.dim('Type:')}     ${pc.white(info.label)} ${pc.dim(`(${methodLabel})`)}`);
  logger.log(`  ${pc.dim('File:')}     ${pc.white(COGNITIVE_FILE_NAMES[type])}`);
}

/**
 * Confirm cognitive type with user (optional)
 */
export async function confirmCognitiveType(
  cognitiveName: string,
  detectedType: CognitiveType,
  method: string
): Promise<{ confirmed: boolean; type: CognitiveType }> {
  showDetectionResult(cognitiveName, detectedType, method);

  logger.line();

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${pc.dim('  Is this correct?')} ${pc.cyan('[Y/n]')}: `, (answer) => {
      rl.close();

      const normalized = answer.trim().toLowerCase();

      if (normalized === '' || normalized === 'y' || normalized === 'yes') {
        resolve({ confirmed: true, type: detectedType });
      } else {
        // User wants to change, prompt for new type
        void promptForCognitiveType(cognitiveName).then((newType) => {
          resolve({ confirmed: true, type: newType });
        });
      }
    });
  });
}
