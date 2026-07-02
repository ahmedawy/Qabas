/**
 * Bitmask constants matching the server-side ServiceFlags column.
 * Each bit indicates whether a specific service has data for a hadith.
 */
export const SERVICE_FLAGS = {
  judgments:   1,   // bit 0 — أحكام
  chains:     2,   // bit 1 — أسانيد
  sanad:      4,   // bit 2 — شجرة السند
  takhreeg:   8,   // bit 3 — تخريج
  combined:   16,  // bit 4 — الشجرة المجمعة
  commentary: 32,  // bit 5 — الشرح
  thematic:   64,  // bit 6 — الموضوعات
  analysis:   128, // bit 7 — التحليل
  occasions:  256, // bit 8 — أسباب الورود
  compound:   512, // bit 9 — المتن المجمع
} as const;

import type { HadithServiceType } from '../types';

/**
 * Check if a specific service is available for a hadith.
 * @param flags - The ServiceFlags bitmask value from the API (default 0)
 * @param service - The service key to check
 * @returns true if the service has data
 */
export function isServiceAvailable(
  flags: number | undefined | null,
  service: HadithServiceType
): boolean {
  if (flags === undefined || flags === null) return false;
  if (service === 'matn_comparison') {
    return (flags & SERVICE_FLAGS.takhreeg) !== 0;
  }
  const mask = (SERVICE_FLAGS as any)[service];
  if (mask === undefined) return false;
  return (flags & mask) !== 0;
}
