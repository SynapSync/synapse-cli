/**
 * Colors Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  colors,
  colorCognitiveType,
  colorCategory,
  colorProvider,
  statusIndicator,
  RESET,
} from '../../../src/ui/colors.js';

describe('colors object', () => {
  it('should have status colors', () => {
    expect(colors.success).toBeDefined();
    expect(colors.error).toBeDefined();
    expect(colors.warning).toBeDefined();
    expect(colors.info).toBeDefined();
  });

  it('should have UI element colors', () => {
    expect(colors.primary).toBeDefined();
    expect(colors.secondary).toBeDefined();
    expect(colors.muted).toBeDefined();
    expect(colors.bold).toBeDefined();
  });

  it('should have cognitive type colors', () => {
    expect(colors.cognitiveType['skill']).toBeDefined();
    expect(colors.cognitiveType['agent']).toBeDefined();
    expect(colors.cognitiveType['prompt']).toBeDefined();
    expect(colors.cognitiveType['workflow']).toBeDefined();
    expect(colors.cognitiveType['tool']).toBeDefined();
  });

  it('should have category colors', () => {
    expect(colors.category['frontend']).toBeDefined();
    expect(colors.category['backend']).toBeDefined();
    expect(colors.category['general']).toBeDefined();
  });

  it('should have provider colors', () => {
    expect(colors.provider['claude']).toBeDefined();
    expect(colors.provider['openai']).toBeDefined();
    expect(colors.provider['cursor']).toBeDefined();
  });
});

describe('colorCognitiveType', () => {
  it('should wrap text with cognitive type color and reset', () => {
    const result = colorCognitiveType('skill', 'my-skill');

    expect(result).toContain('my-skill');
    expect(result).toContain(RESET);
  });

  it('should use default color for unknown types', () => {
    const result = colorCognitiveType('unknown', 'text');

    expect(result).toContain('text');
    expect(result).toContain(RESET);
  });
});

describe('colorCategory', () => {
  it('should wrap text with category color and reset', () => {
    const result = colorCategory('frontend', 'Frontend');

    expect(result).toContain('Frontend');
    expect(result).toContain(RESET);
  });

  it('should use default color for unknown categories', () => {
    const result = colorCategory('unknown', 'text');

    expect(result).toContain('text');
    expect(result).toContain(RESET);
  });
});

describe('colorProvider', () => {
  it('should wrap text with provider color', () => {
    const result = colorProvider('claude', 'Claude');

    expect(result).toContain('Claude');
    expect(result).toContain(RESET);
  });

  it('should use white for unknown providers', () => {
    const result = colorProvider('unknown-provider', 'Unknown');

    expect(result).toContain('Unknown');
  });
});

describe('statusIndicator', () => {
  it('should return green dot for connected', () => {
    const result = statusIndicator('connected');
    expect(result).toContain('●');
  });

  it('should return dim circle for disconnected', () => {
    const result = statusIndicator('disconnected');
    expect(result).toContain('○');
  });

  it('should return red dot for error', () => {
    const result = statusIndicator('error');
    expect(result).toContain('●');
  });

  it('should return yellow half-circle for pending', () => {
    const result = statusIndicator('pending');
    expect(result).toContain('◐');
  });
});
