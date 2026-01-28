/**
 * Asset Type Prompter
 *
 * Interactive prompts for when asset type cannot be auto-detected
 */

import * as readline from 'readline';
import pc from 'picocolors';
import { ASSET_TYPES, ASSET_FILE_NAMES } from '../../core/constants.js';
import type { AssetType } from '../../core/constants.js';
import { logger } from '../../utils/logger.js';

/**
 * Asset type display info for prompts
 */
const ASSET_TYPE_INFO: Record<AssetType, { label: string; description: string }> = {
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
 * Prompt user to select asset type interactively
 */
export async function promptForAssetType(assetName: string): Promise<AssetType> {
  logger.line();
  logger.warning(`Could not detect asset type for: ${pc.cyan(assetName)}`);
  logger.line();
  logger.log(pc.bold('  What type of asset is this?'));
  logger.line();

  // Display options
  ASSET_TYPES.forEach((type, index) => {
    const info = ASSET_TYPE_INFO[type];
    const num = pc.cyan(`  ${index + 1}.`);
    const label = pc.white(info.label.padEnd(10));
    const file = pc.dim(`(${ASSET_FILE_NAMES[type]})`);
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

        if (num >= 1 && num <= ASSET_TYPES.length) {
          const selectedType = ASSET_TYPES[num - 1];
          if (selectedType) {
            rl.close();
            logger.line();
            logger.success(`Selected: ${ASSET_TYPE_INFO[selectedType].label}`);
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
  assetName: string,
  type: AssetType,
  method: string
): void {
  const info = ASSET_TYPE_INFO[type];
  const methodLabels: Record<string, string> = {
    flag: 'specified via --type flag',
    registry: 'found in registry',
    file: 'detected from file',
    prompt: 'selected by user',
  };

  const methodLabel = methodLabels[method] ?? method;

  logger.line();
  logger.info(`Asset: ${pc.cyan(assetName)}`);
  logger.log(`  ${pc.dim('Type:')}     ${pc.white(info.label)} ${pc.dim(`(${methodLabel})`)}`);
  logger.log(`  ${pc.dim('File:')}     ${pc.white(ASSET_FILE_NAMES[type])}`);
}

/**
 * Confirm asset type with user (optional)
 */
export async function confirmAssetType(
  assetName: string,
  detectedType: AssetType,
  method: string
): Promise<{ confirmed: boolean; type: AssetType }> {
  showDetectionResult(assetName, detectedType, method);

  logger.line();

  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(
      `${pc.dim('  Is this correct?')} ${pc.cyan('[Y/n]')}: `,
      (answer) => {
        rl.close();

        const normalized = answer.trim().toLowerCase();

        if (normalized === '' || normalized === 'y' || normalized === 'yes') {
          resolve({ confirmed: true, type: detectedType });
        } else {
          // User wants to change, prompt for new type
          void promptForAssetType(assetName).then((newType) => {
            resolve({ confirmed: true, type: newType });
          });
        }
      }
    );
  });
}
