/**
 * Soft delete / recycle bin retention rules.
 * Shared by DocumentsService (soft delete), RecycleBinService (restore, purge)
 * and the scheduled purge task so the window is defined in exactly one place.
 */

/** Days a soft-deleted document remains restorable before permanent deletion. */
export const DELETION_RETENTION_DAYS = 30;

/** Storage key prefix for the holding area soft-deleted files are moved to. */
export const DELETED_KEY_PREFIX = 'deleted/';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Storage key a document's file is moved to when it is soft deleted. */
export function toDeletedStorageKey(storageKey: string): string {
  return storageKey.startsWith(DELETED_KEY_PREFIX)
    ? storageKey
    : `${DELETED_KEY_PREFIX}${storageKey}`;
}

/** Storage key a document's file is moved back to when it is restored. */
export function toActiveStorageKey(storageKey: string): string {
  return storageKey.startsWith(DELETED_KEY_PREFIX)
    ? storageKey.slice(DELETED_KEY_PREFIX.length)
    : storageKey;
}

/** Documents soft-deleted before this instant are eligible for permanent deletion. */
export function getPurgeCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - DELETION_RETENTION_DAYS * MS_PER_DAY);
}

/** Whole days left in the restore window (never negative). */
export function getDaysRemaining(
  deletedAt: Date,
  now: Date = new Date(),
): number {
  const expiresAt = deletedAt.getTime() + DELETION_RETENTION_DAYS * MS_PER_DAY;
  return Math.max(0, Math.ceil((expiresAt - now.getTime()) / MS_PER_DAY));
}
