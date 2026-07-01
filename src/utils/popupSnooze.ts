const STORAGE_PREFIX = 'announcement-popup-snooze';

function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function storageKey(userId: number, popupId: number): string {
  return `${STORAGE_PREFIX}:${userId}:${popupId}`;
}

export function isPopupSnoozedForToday(userId: number, popupId: number): boolean {
  try {
    return localStorage.getItem(storageKey(userId, popupId)) === getLocalDateKey();
  } catch {
    return false;
  }
}

export function snoozePopupForToday(userId: number, popupId: number): void {
  try {
    localStorage.setItem(storageKey(userId, popupId), getLocalDateKey());
  } catch {
    // Ignore storage failures; popup may reappear on refresh.
  }
}

export function filterSnoozedPopups<T extends { id: number }>(userId: number | null | undefined, items: T[]): T[] {
  if (userId == null) {
    return items;
  }

  return items.filter((item) => !isPopupSnoozedForToday(userId, item.id));
}
