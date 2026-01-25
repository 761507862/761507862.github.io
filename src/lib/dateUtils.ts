// Date utilities for Asia/Shanghai timezone handling

export const GAME_TIMEZONE = 'Asia/Shanghai';

/**
 * Gets the current date string (YYYY-MM-DD) in the game's timezone
 */
export const getTodayDateString = (): string => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: GAME_TIMEZONE,
    year: 'numeric',
    month: 'numeric', // M or MM depending on locale, usually we want strict format but for comparison component logic works if consistent
    day: 'numeric',
  });
  return formatter.format(now);
};

/**
 * Formats a timestamp to date string (M/D/YYYY) in game's timezone
 */
export const formatDateInGameZone = (timestamp: number | Date): string => {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return new Intl.DateTimeFormat('en-US', {
    timeZone: GAME_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(date);
};

/**
 * Gets the current date string for display (YYYY/MM/DD) in the game's timezone
 */
export const getDisplayDateString = (): string => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: GAME_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now); // 2023/10/26
};

/**
 * Checks if a timestamp falls on "today" in game's timezone
 */
export const isTodayInGameZone = (timestamp: number | Date): boolean => {
  return formatDateInGameZone(timestamp) === getTodayDateString();
};
