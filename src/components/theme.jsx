import { createContext, useContext, useState, useEffect, useCallback } from "react";

/* ============================================================================
   Theme — InsightLab (dark "Nocturne"  <->  light "Daylight")
   Visual layer only. Drives the [data-theme] attribute on <html>; all colors
   come from CSS variables in nocturne.css, so the switch is instant + global.

   По умолчанию — светлая тема ("Daylight"). Выбор пользователя сохраняется
   и имеет приоритет над значением по умолчанию.
   ============================================================================ */

const STORAGE_KEY = "insightlab_theme";
const ThemeCtx = createContext({ theme: "light", setTheme: () => {}, toggle: () => {} });

function readStored() {
  try {
    const t = window.localStorage.getItem(STORAGE_KEY);
    if (t === "light" || t === "dark") return t;
  } catch (_) { /* storage blocked — ignore */ }
  return null;
}
function readSystem() {
  // По умолчанию — светлая тема. Выбор пользователя (readStored) имеет приоритет;
  // здесь только значение по умолчанию для нового пользователя.
  return "light";
}

export function ThemeProvider({ children, initial, onChange }) {
  const [theme, setThemeState] = useState(() => initial || readStored() || readSystem());

  // keep <html data-theme> in sync + persist defensively
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { window.localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }, [theme]);

  // follow an externally controlled value (e.g. profile loaded from Supabase)
  useEffect(() => { if (initial && initial !== theme) setThemeState(initial); /* eslint-disable-next-line */ }, [initial]);

  const setTheme = useCallback((t) => {
    const next = t === "light" || t === "dark" ? t : "light";
    setThemeState(next);
    if (onChange) { try { onChange(next); } catch (_) {} } // e.g. write to profile
  }, [onChange]);

  const toggle = useCallback(() => setTheme(theme === "dark" ? "light" : "dark"), [theme, setTheme]);

  return <ThemeCtx.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() { return useContext(ThemeCtx); }

/* Sun / Moon toggle button. Drop it in the topbar next to the user name. */
export function ThemeToggle({ size = 38, title = "Сменить тему" }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      className="n-theme-toggle"
      onClick={toggle}
      title={title}
      aria-label={title}
      style={{ width: size, height: size }}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: dark ? "rotate(0deg)" : "rotate(90deg) scale(1.05)", color: dark ? "#7dc5ee" : "#F2994A" }}>
        {dark ? (
          /* moon */
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        ) : (
          /* sun */
          <g>
            <circle cx="12" cy="12" r="4.2" />
            <line x1="12" y1="2.5" x2="12" y2="5" /><line x1="12" y1="19" x2="12" y2="21.5" />
            <line x1="2.5" y1="12" x2="5" y2="12" /><line x1="19" y1="12" x2="21.5" y2="12" />
            <line x1="5" y1="5" x2="6.8" y2="6.8" /><line x1="17.2" y1="17.2" x2="19" y2="19" />
            <line x1="5" y1="19" x2="6.8" y2="17.2" /><line x1="17.2" y1="6.8" x2="19" y2="5" />
          </g>
        )}
      </svg>
    </button>
  );
}