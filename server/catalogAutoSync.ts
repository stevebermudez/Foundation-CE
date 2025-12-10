/**
 * Catalog Auto-Sync Module
 * 
 * Automatically exports the course catalog snapshot whenever content is modified.
 * This ensures the snapshot file is always up-to-date and production deployments
 * will have the latest course content.
 * 
 * USAGE:
 * Call triggerCatalogSync() after any admin operation that modifies:
 * - Courses
 * - Units
 * - Lessons
 * - Question Banks
 * - Bank Questions
 * - Practice Exams
 * - Exam Questions
 * - Bundles
 */

import { exportCourseCatalog } from './exportCourseCatalog';

let syncInProgress = false;
let pendingSync = false;
let lastSyncTime: Date | null = null;
let lastSyncError: string | null = null;

export interface SyncStatus {
  lastSyncTime: Date | null;
  lastSyncError: string | null;
  syncInProgress: boolean;
}

/**
 * Triggers an automatic catalog export.
 * Debounces rapid changes to avoid excessive exports.
 */
export async function triggerCatalogSync(): Promise<void> {
  if (syncInProgress) {
    pendingSync = true;
    console.log('📦 Catalog sync already in progress, queuing next sync...');
    return;
  }

  syncInProgress = true;
  pendingSync = false;

  try {
    console.log('📦 Auto-syncing catalog snapshot...');
    const result = await exportCourseCatalog();
    
    if (result.success) {
      lastSyncTime = new Date();
      lastSyncError = null;
      console.log(`✅ Catalog snapshot updated: ${result.coursesExported} courses, ${result.unitsExported} units, ${result.lessonsExported} lessons`);
    } else {
      lastSyncError = result.error || 'Unknown error';
      console.error('❌ Catalog sync failed:', lastSyncError);
    }
  } catch (error) {
    lastSyncError = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Catalog sync error:', lastSyncError);
  } finally {
    syncInProgress = false;
    
    if (pendingSync) {
      setTimeout(() => triggerCatalogSync(), 1000);
    }
  }
}

/**
 * Get the current sync status
 */
export function getSyncStatus(): SyncStatus {
  return {
    lastSyncTime,
    lastSyncError,
    syncInProgress
  };
}

/**
 * Debounced sync trigger - waits 2 seconds after last call before syncing
 * This prevents excessive exports during bulk operations
 */
let debounceTimer: NodeJS.Timeout | null = null;

export function triggerCatalogSyncDebounced(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }
  
  debounceTimer = setTimeout(() => {
    triggerCatalogSync();
    debounceTimer = null;
  }, 2000);
}
