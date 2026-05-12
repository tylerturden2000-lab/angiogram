/**
 * themeConfig.js
 * ──────────────────────────────────────────────────────────────
 * Design-token definitions for every supported theme.
 *
 * HOW TO ADD A NEW THEME:
 *   1. Add a new key to THEME_TOKENS below (e.g. 'high-contrast').
 *   2. Supply all required token keys.
 *   3. The theme toggle in the sidebar will need a new button
 *      added in sidebarConfig (optional) or in SidebarBottom.
 *
 * ADD NEW THEMES HERE ↓
 */

export const THEME_TOKENS = {
  dark: {
    bg:            '#060C14',
    text:          '#C8DCF0',
    textSecondary: '#5E82A8',
    card:          '#0D1829',
    border:        '#1A2E45',
    header:        '#080F1C',
    itemBg:        '#112035',
    primary:       '#1E6FD9',
    primaryLight:  'rgba(30,111,217,0.12)',
    secondary:     '#3B96F5',
  },
  light: {
    bg:            '#F0F2F5',
    text:          '#0F1923',
    textSecondary: '#4A5568',
    card:          '#FFFFFF',
    border:        '#E2E6ED',
    header:        '#FFFFFF',
    itemBg:        '#F7F8FA',
    primary:       '#059669',
    primaryLight:  'rgba(5,150,105,0.07)',
    secondary:     '#1A7FE8',
  },
};

/** Returns tokens for the given theme key, defaulting to 'light'. */
export const getThemeTokens = (theme) =>
  THEME_TOKENS[theme] ?? THEME_TOKENS.light;
