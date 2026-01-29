/**
 * Registry Client
 *
 * Handles fetching and querying the SynapSync public registry
 */

import {
  REGISTRY_BASE_URL,
  REGISTRY_INDEX_FILE,
  REGISTRY_MANIFEST_FILE,
} from '../../core/constants.js';
import type {
  RegistryIndex,
  RegistryCognitiveEntry,
  CognitiveManifest,
  RegistrySearchResult,
  DownloadedCognitive,
  CognitiveType,
  Category,
} from '../../types/index.js';

// ============================================
// Types
// ============================================

export interface SearchOptions {
  type?: CognitiveType;
  category?: Category;
  tag?: string;
  limit?: number;
}

export interface RegistryClientOptions {
  baseUrl?: string;
  cacheDir?: string;
  cacheTtl?: number; // milliseconds
}

// ============================================
// RegistryClient Class
// ============================================

export class RegistryClient {
  private baseUrl: string;
  private indexCache: RegistryIndex | null = null;
  private indexCacheTime: number = 0;
  private cacheTtl: number;

  constructor(options: RegistryClientOptions = {}) {
    this.baseUrl = options.baseUrl ?? REGISTRY_BASE_URL;
    this.cacheTtl = options.cacheTtl ?? 5 * 60 * 1000; // 5 minutes default
  }

  // ============================================
  // Index Operations
  // ============================================

  /**
   * Fetch the registry index
   */
  async getIndex(forceRefresh = false): Promise<RegistryIndex> {
    const now = Date.now();

    // Return cached if still valid
    if (!forceRefresh && this.indexCache !== null && now - this.indexCacheTime < this.cacheTtl) {
      return this.indexCache;
    }

    const url = `${this.baseUrl}/${REGISTRY_INDEX_FILE}`;
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new RegistryError(`Failed to fetch registry index: ${response.status} ${response.statusText}`, url);
    }

    const index = (await response.json()) as RegistryIndex;
    this.indexCache = index;
    this.indexCacheTime = now;

    return index;
  }

  /**
   * Get total count of cognitives in registry
   */
  async getCount(): Promise<number> {
    const index = await this.getIndex();
    return index.totalCognitives;
  }

  // ============================================
  // Search Operations
  // ============================================

  /**
   * Search for cognitives in the registry
   */
  async search(query?: string, options: SearchOptions = {}): Promise<RegistrySearchResult> {
    const index = await this.getIndex();
    let results = [...index.cognitives];

    // Filter by query (searches name, description, tags)
    if (query !== undefined && query.trim() !== '') {
      const q = query.toLowerCase();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filter by type
    if (options.type !== undefined) {
      results = results.filter((c) => c.type === options.type);
    }

    // Filter by category
    if (options.category !== undefined) {
      results = results.filter((c) => c.category === options.category);
    }

    // Filter by tag
    if (options.tag !== undefined) {
      const tag = options.tag.toLowerCase();
      results = results.filter((c) => c.tags.some((t) => t.toLowerCase() === tag));
    }

    // Apply limit
    const total = results.length;
    if (options.limit !== undefined && options.limit > 0) {
      results = results.slice(0, options.limit);
    }

    const filters: { type?: CognitiveType; category?: Category; tag?: string } = {};
    if (options.type !== undefined) filters.type = options.type;
    if (options.category !== undefined) filters.category = options.category;
    if (options.tag !== undefined) filters.tag = options.tag;

    return {
      cognitives: results,
      total,
      ...(query !== undefined ? { query } : {}),
      filters,
    };
  }

  /**
   * Find a cognitive by name
   */
  async findByName(name: string): Promise<RegistryCognitiveEntry | null> {
    const index = await this.getIndex();
    return index.cognitives.find((c) => c.name === name) ?? null;
  }

  /**
   * List all cognitives
   */
  async list(options: SearchOptions = {}): Promise<RegistryCognitiveEntry[]> {
    const result = await this.search(undefined, options);
    return result.cognitives;
  }

  // ============================================
  // Download Operations
  // ============================================

  /**
   * Get the manifest for a cognitive
   */
  async getManifest(cognitiveEntry: RegistryCognitiveEntry): Promise<CognitiveManifest> {
    const url = `${this.baseUrl}/${cognitiveEntry.path}/${REGISTRY_MANIFEST_FILE}`;
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new RegistryError(
        `Failed to fetch manifest for ${cognitiveEntry.name}: ${response.status} ${response.statusText}`,
        url
      );
    }

    return (await response.json()) as CognitiveManifest;
  }

  /**
   * Get the content file for a cognitive
   */
  async getContent(cognitiveEntry: RegistryCognitiveEntry, manifest: CognitiveManifest): Promise<string> {
    const url = `${this.baseUrl}/${cognitiveEntry.path}/${manifest.file}`;
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new RegistryError(
        `Failed to fetch content for ${cognitiveEntry.name}: ${response.status} ${response.statusText}`,
        url
      );
    }

    return response.text();
  }

  /**
   * Download a cognitive (manifest + content)
   */
  async download(name: string): Promise<DownloadedCognitive> {
    // Find in registry
    const entry = await this.findByName(name);
    if (entry === null) {
      throw new CognitiveNotFoundError(name);
    }

    // Get manifest
    const manifest = await this.getManifest(entry);

    // Get content
    const content = await this.getContent(entry, manifest);

    return {
      manifest,
      content,
      path: entry.path,
    };
  }

  /**
   * Download additional assets for a cognitive
   */
  async downloadAsset(cognitiveEntry: RegistryCognitiveEntry, assetPath: string): Promise<string> {
    const url = `${this.baseUrl}/${cognitiveEntry.path}/${assetPath}`;
    const response = await this.fetch(url);

    if (!response.ok) {
      throw new RegistryError(
        `Failed to fetch asset ${assetPath} for ${cognitiveEntry.name}: ${response.status} ${response.statusText}`,
        url
      );
    }

    return response.text();
  }

  // ============================================
  // Utility Methods
  // ============================================

  /**
   * Check if registry is reachable
   */
  async ping(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/${REGISTRY_INDEX_FILE}`;
      const response = await this.fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.indexCache = null;
    this.indexCacheTime = 0;
  }

  /**
   * Get the base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // ============================================
  // Private Methods
  // ============================================

  private async fetch(url: string, options?: RequestInit): Promise<Response> {
    try {
      return await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'SynapSync-CLI',
          ...options?.headers,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new RegistryError(`Network error: ${error.message}`, url);
      }
      throw new RegistryError('Network error', url);
    }
  }
}

// ============================================
// Custom Errors
// ============================================

export class RegistryError extends Error {
  constructor(
    message: string,
    public url: string
  ) {
    super(message);
    this.name = 'RegistryError';
  }
}

export class CognitiveNotFoundError extends Error {
  constructor(public cognitiveName: string) {
    super(`Cognitive '${cognitiveName}' not found in registry`);
    this.name = 'CognitiveNotFoundError';
  }
}
