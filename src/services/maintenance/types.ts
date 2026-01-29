/**
 * Maintenance Services Types
 *
 * Type definitions for update, doctor, and clean services
 */

import type { CognitiveType, Category } from '../../core/constants.js';

// ============================================
// Update Types
// ============================================

/**
 * Information about a cognitive update
 */
export interface UpdateInfo {
  name: string;
  type: CognitiveType;
  category: Category;
  currentVersion: string;
  latestVersion: string;
  hasUpdate: boolean;
  source: 'registry' | 'local' | 'github';
}

/**
 * Result of checking for updates
 */
export interface UpdateCheckResult {
  checked: number;
  updatesAvailable: UpdateInfo[];
  upToDate: UpdateInfo[];
  errors: UpdateError[];
  checkTime: string;
}

/**
 * Error during update check
 */
export interface UpdateError {
  cognitive: string;
  message: string;
}

/**
 * Result of performing an update
 */
export interface UpdateResult {
  success: boolean;
  updated: string[];
  failed: Array<{ name: string; error: string }>;
  skipped: string[];
  duration: number;
}

/**
 * Options for update operations
 */
export interface UpdateOptions {
  /** Update all cognitives */
  all?: boolean;
  /** Force update even if already latest */
  force?: boolean;
  /** Dry run - don't actually update */
  dryRun?: boolean;
  /** Re-sync providers after update */
  sync?: boolean;
}

// ============================================
// Doctor Types
// ============================================

/**
 * A single diagnostic check
 */
export interface DiagnosticCheck {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'warn' | 'fail' | 'skip';
  message: string;
  fixable: boolean;
  details?: string[];
}

/**
 * Result of running diagnostics
 */
export interface DiagnosticResult {
  checks: DiagnosticCheck[];
  passed: number;
  warnings: number;
  failed: number;
  skipped: number;
  healthy: boolean;
  duration: number;
}

/**
 * Result of fix operation
 */
export interface FixResult {
  success: boolean;
  fixed: string[];
  failed: Array<{ check: string; error: string }>;
  duration: number;
}

/**
 * Options for doctor command
 */
export interface DoctorOptions {
  /** Auto-fix issues */
  fix?: boolean;
  /** Specific checks to run */
  checks?: string[];
  /** Verbose output */
  verbose?: boolean;
}

// ============================================
// Clean Types
// ============================================

/**
 * Result of clean operation
 */
export interface CleanResult {
  success: boolean;
  /** Items cleaned */
  cleaned: CleanedItem[];
  /** Total bytes freed */
  bytesFreed: number;
  /** Human readable size */
  sizeFreed: string;
  /** Errors encountered */
  errors: CleanError[];
  duration: number;
}

/**
 * A cleaned item
 */
export interface CleanedItem {
  type: 'cache' | 'orphan' | 'temp';
  path: string;
  size: number;
}

/**
 * Error during clean
 */
export interface CleanError {
  path: string;
  message: string;
}

/**
 * Options for clean command
 */
export interface CleanOptions {
  /** Clean registry cache */
  cache?: boolean;
  /** Clean orphaned symlinks */
  orphans?: boolean;
  /** Clean temp files */
  temp?: boolean;
  /** Clean everything */
  all?: boolean;
  /** Dry run */
  dryRun?: boolean;
}
