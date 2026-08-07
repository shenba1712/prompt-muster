'use client';

import { useEffect, useState, type JSX } from 'react';
import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { THEME_COOKIE_NAME } from '@/lib/theme';

export default function ThemeToggle(): JSX.Element {
  // Starts false so server and first client render match (avoids a
  // hydration mismatch on the icon); synced to the real value right after
  // mount.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Legitimate exception to the rule: this syncs from an external system,
    // not state derivable during render. Reading `document`/`matchMedia` in
    // the initializer would run this same code on the server too and throw,
    // so the sync has to happen post-mount.
    //
    // No explicit [data-theme] means the visitor never toggled — globals.css
    // resolves that case live via `@media (prefers-color-scheme: dark)`, so
    // the page is already showing the right theme by the time this runs.
    // This only needs to make the icon agree with what's already on screen.
    const theme = document.documentElement.dataset.theme;
    const resolvedDark =
      theme === 'dark' ||
      (theme !== 'light' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(resolvedDark);
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    document.cookie = `${THEME_COOKIE_NAME}=${next ? 'dark' : 'light'}; path=/; max-age=31536000; SameSite=Lax`;
    setIsDark(next);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="min-h-11 min-w-11 text-muted-foreground hover:text-foreground"
    >
      {isDark ? (
        <SunIcon className="size-5" />
      ) : (
        <MoonIcon className="size-5" />
      )}
    </Button>
  );
}
