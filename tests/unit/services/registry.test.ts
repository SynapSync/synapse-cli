/**
 * Registry Client Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  RegistryClient,
  RegistryError,
  CognitiveNotFoundError,
} from '../../../src/services/registry/client.js';
import type {
  RegistryIndex,
  RegistryCognitiveEntry,
  CognitiveManifest,
} from '../../../src/types/index.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

// ============================================
// Test Data
// ============================================

const mockEntry: RegistryCognitiveEntry = {
  name: 'code-reviewer',
  type: 'skill',
  version: '1.0.0',
  description: 'Reviews code for best practices',
  author: 'synapsync',
  category: 'general',
  tags: ['code', 'review', 'quality'],
  providers: ['claude', 'cursor'],
  downloads: 100,
  path: 'skills/general/code-reviewer',
};

const mockEntry2: RegistryCognitiveEntry = {
  name: 'test-agent',
  type: 'agent',
  version: '2.0.0',
  description: 'An agent for testing',
  author: 'test-author',
  category: 'testing',
  tags: ['testing', 'automation'],
  providers: ['claude'],
  downloads: 50,
  path: 'agents/testing/test-agent',
};

const mockIndex: RegistryIndex = {
  version: '1.0.0',
  lastUpdated: '2026-01-01T00:00:00.000Z',
  totalCognitives: 2,
  cognitives: [mockEntry, mockEntry2],
};

const mockManifest: CognitiveManifest = {
  name: 'code-reviewer',
  type: 'skill',
  version: '1.0.0',
  description: 'Reviews code for best practices',
  author: 'synapsync',
  license: 'MIT',
  category: 'general',
  tags: ['code', 'review'],
  providers: ['claude'],
  file: 'SKILL.md',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

function jsonResponse(data: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? 'OK' : 'Not Found',
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    headers: new Headers(),
  } as Response;
}

// ============================================
// Tests
// ============================================

describe('RegistryClient', () => {
  let client: RegistryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    client = new RegistryClient({ baseUrl: 'https://test-registry.example.com' });
  });

  describe('constructor', () => {
    it('should use default base URL when none provided', () => {
      const defaultClient = new RegistryClient();
      expect(defaultClient.getBaseUrl()).toContain('github');
    });

    it('should use custom base URL', () => {
      expect(client.getBaseUrl()).toBe('https://test-registry.example.com');
    });
  });

  describe('getIndex', () => {
    it('should fetch and return the registry index', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockIndex));

      const index = await client.getIndex();

      expect(index).toEqual(mockIndex);
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    it('should cache the index on subsequent calls', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockIndex));

      await client.getIndex();
      const second = await client.getIndex();

      expect(second).toEqual(mockIndex);
      expect(mockFetch).toHaveBeenCalledOnce();
    });

    it('should force refresh when requested', async () => {
      mockFetch.mockResolvedValue(jsonResponse(mockIndex));

      await client.getIndex();
      await client.getIndex(true);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should throw RegistryError on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(null, 500));

      await expect(client.getIndex()).rejects.toThrow(RegistryError);
    });

    it('should throw RegistryError on network failure', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network unreachable'));

      await expect(client.getIndex()).rejects.toThrow('Network error');
    });

    it('should throw RegistryError for non-Error throws', async () => {
      mockFetch.mockRejectedValueOnce('string error');

      await expect(client.getIndex()).rejects.toThrow(RegistryError);
    });
  });

  describe('getCount', () => {
    it('should return total cognitives count', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockIndex));

      const count = await client.getCount();
      expect(count).toBe(2);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue(jsonResponse(mockIndex));
    });

    it('should return all cognitives when no query or filters', async () => {
      const result = await client.search();

      expect(result.total).toBe(2);
      expect(result.cognitives).toHaveLength(2);
    });

    it('should filter by name query', async () => {
      const result = await client.search('code-reviewer');

      expect(result.total).toBe(1);
      expect(result.cognitives[0]?.name).toBe('code-reviewer');
    });

    it('should filter by description query', async () => {
      const result = await client.search('testing');

      expect(result.total).toBe(1);
      expect(result.cognitives[0]?.name).toBe('test-agent');
    });

    it('should filter by tag query', async () => {
      const result = await client.search('automation');

      expect(result.total).toBe(1);
      expect(result.cognitives[0]?.name).toBe('test-agent');
    });

    it('should be case-insensitive', async () => {
      const result = await client.search('CODE-REVIEWER');

      expect(result.total).toBe(1);
    });

    it('should filter by type', async () => {
      const result = await client.search(undefined, { type: 'agent' });

      expect(result.total).toBe(1);
      expect(result.cognitives[0]?.type).toBe('agent');
    });

    it('should filter by category', async () => {
      const result = await client.search(undefined, { category: 'testing' });

      expect(result.total).toBe(1);
      expect(result.cognitives[0]?.category).toBe('testing');
    });

    it('should filter by tag option', async () => {
      const result = await client.search(undefined, { tag: 'quality' });

      expect(result.total).toBe(1);
      expect(result.cognitives[0]?.name).toBe('code-reviewer');
    });

    it('should apply limit', async () => {
      const result = await client.search(undefined, { limit: 1 });

      expect(result.cognitives).toHaveLength(1);
      expect(result.total).toBe(2);
    });

    it('should combine multiple filters', async () => {
      const result = await client.search('test', { type: 'agent', category: 'testing' });

      expect(result.total).toBe(1);
      expect(result.cognitives[0]?.name).toBe('test-agent');
    });

    it('should return empty results when nothing matches', async () => {
      const result = await client.search('nonexistent');

      expect(result.total).toBe(0);
      expect(result.cognitives).toHaveLength(0);
    });

    it('should ignore empty query string', async () => {
      const result = await client.search('   ');

      expect(result.total).toBe(2);
    });

    it('should include query in result', async () => {
      const result = await client.search('test');

      expect(result.query).toBe('test');
    });

    it('should include filters in result', async () => {
      const result = await client.search(undefined, {
        type: 'skill',
        category: 'general',
        tag: 'code',
      });

      expect(result.filters).toEqual({ type: 'skill', category: 'general', tag: 'code' });
    });
  });

  describe('findByName', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue(jsonResponse(mockIndex));
    });

    it('should find a cognitive by exact name', async () => {
      const entry = await client.findByName('code-reviewer');

      expect(entry).toEqual(mockEntry);
    });

    it('should return null when not found', async () => {
      const entry = await client.findByName('nonexistent');

      expect(entry).toBeNull();
    });
  });

  describe('list', () => {
    beforeEach(() => {
      mockFetch.mockResolvedValue(jsonResponse(mockIndex));
    });

    it('should list all cognitives', async () => {
      const entries = await client.list();

      expect(entries).toHaveLength(2);
    });

    it('should list with filters', async () => {
      const entries = await client.list({ type: 'skill' });

      expect(entries).toHaveLength(1);
      expect(entries[0]?.type).toBe('skill');
    });
  });

  describe('getManifest', () => {
    it('should fetch manifest for a cognitive entry', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockManifest));

      const manifest = await client.getManifest(mockEntry);

      expect(manifest).toEqual(mockManifest);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('skills/general/code-reviewer/manifest.json'),
        expect.any(Object)
      );
    });

    it('should throw RegistryError on failure', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(null, 404));

      await expect(client.getManifest(mockEntry)).rejects.toThrow(RegistryError);
    });
  });

  describe('getContent', () => {
    it('should fetch content for a cognitive', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('# Code Reviewer\nThis skill reviews code.'),
        headers: new Headers(),
      } as Response;
      mockFetch.mockResolvedValueOnce(mockResponse);

      const content = await client.getContent(mockEntry, mockManifest);

      expect(content).toBe('# Code Reviewer\nThis skill reviews code.');
    });

    it('should throw RegistryError on failure', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(null, 404));

      await expect(client.getContent(mockEntry, mockManifest)).rejects.toThrow(RegistryError);
    });
  });

  describe('download', () => {
    it('should download manifest and content', async () => {
      // First call: getIndex (for findByName)
      mockFetch.mockResolvedValueOnce(jsonResponse(mockIndex));
      // Second call: getManifest
      mockFetch.mockResolvedValueOnce(jsonResponse(mockManifest));
      // Third call: getContent
      const contentResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('# Code Reviewer'),
        headers: new Headers(),
      } as Response;
      mockFetch.mockResolvedValueOnce(contentResponse);

      const result = await client.download('code-reviewer');

      expect(result.manifest).toEqual(mockManifest);
      expect(result.content).toBe('# Code Reviewer');
      expect(result.path).toBe('skills/general/code-reviewer');
    });

    it('should throw CognitiveNotFoundError when not in registry', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(mockIndex));

      await expect(client.download('nonexistent')).rejects.toThrow(CognitiveNotFoundError);
    });
  });

  describe('downloadAsset', () => {
    it('should download an asset file', async () => {
      const assetResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: () => Promise.resolve('asset content'),
        headers: new Headers(),
      } as Response;
      mockFetch.mockResolvedValueOnce(assetResponse);

      const content = await client.downloadAsset(mockEntry, 'assets/template.md');

      expect(content).toBe('asset content');
    });

    it('should throw RegistryError on failure', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(null, 404));

      await expect(client.downloadAsset(mockEntry, 'missing.md')).rejects.toThrow(RegistryError);
    });
  });

  describe('ping', () => {
    it('should return true when registry is reachable', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(null, 200));

      const result = await client.ping();
      expect(result).toBe(true);
    });

    it('should return false on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce(jsonResponse(null, 500));

      const result = await client.ping();
      expect(result).toBe(false);
    });

    it('should return false on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await client.ping();
      expect(result).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should force re-fetch after clearing cache', async () => {
      mockFetch.mockResolvedValue(jsonResponse(mockIndex));

      await client.getIndex();
      client.clearCache();
      await client.getIndex();

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('RegistryError', () => {
    it('should include url property', () => {
      const error = new RegistryError('test error', 'https://example.com');

      expect(error.message).toBe('test error');
      expect(error.url).toBe('https://example.com');
      expect(error.name).toBe('RegistryError');
    });
  });

  describe('CognitiveNotFoundError', () => {
    it('should include cognitive name', () => {
      const error = new CognitiveNotFoundError('my-skill');

      expect(error.message).toContain('my-skill');
      expect(error.cognitiveName).toBe('my-skill');
      expect(error.name).toBe('CognitiveNotFoundError');
    });
  });
});
