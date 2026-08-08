/**
 * Theme Constants
 * Defines theme mode options and storage key for theme persistence
 */

export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
};

export const THEME_STORAGE_KEY = '@foodstall_theme_mode';

export const THEME_MODE_LABELS = {
  [THEME_MODES.LIGHT]: 'Light Mode',
  [THEME_MODES.DARK]: 'Dark Mode',
  [THEME_MODES.AUTO]: 'Automatic (System)',
};
