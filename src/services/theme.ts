import type { Theme } from '../types';

const THEME_KEY = 'theme_preference';

export const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_KEY) as Theme | null;
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system';
};

export const setStoredTheme = (theme: Theme) => {
  localStorage.setItem(THEME_KEY, theme);
};

const prefersDark = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  const effective = theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme;

  root.classList.remove('light', 'dark');
  root.classList.add(effective);
};

export const initTheme = () => {
  const theme = getStoredTheme();
  applyTheme(theme);

  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    const current = getStoredTheme();
    if (current === 'system') applyTheme('system');
  };

  if (media.addEventListener) {
    media.addEventListener('change', handler);
  } else {
    media.addListener(handler);
  }

  return () => {
    if (media.removeEventListener) {
      media.removeEventListener('change', handler);
    } else {
      media.removeListener(handler);
    }
  };
};
