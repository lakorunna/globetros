import { useEffect, useState } from 'react';
import './ThemeToggle.css';

// Temporary switcher for trying the two visual directions side by side
const THEMES = [
  { id: 'journal', label: 'Dagbog' },
  { id: 'serial', label: 'Eventyr' },
];
const STORAGE_KEY = 'globetros-theme';

function readStoredTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return THEMES.some(t => t.id === stored) ? stored : THEMES[0].id;
  } catch {
    return THEMES[0].id;
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(readStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be blocked; the theme just won't be remembered
    }
  }, [theme]);

  return (
    <div className="theme-toggle" role="group" aria-label="Visuel stil">
      {THEMES.map(t => (
        <button
          key={t.id}
          className={`theme-toggle__btn${t.id === theme ? ' theme-toggle__btn--on' : ''}`}
          onClick={() => setTheme(t.id)}
          aria-pressed={t.id === theme}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
