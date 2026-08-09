'use client';

import { useEffect, useState, type JSX } from 'react';
import { MonitorIcon, MoonIcon, SunIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { THEME_COOKIE_NAME, type Theme } from '@/lib/theme';

// One button covers all three states by cycling through them. Ending on
// 'system' rather than starting there means the two explicit choices stay one
// click apart, which is the common case.
const NEXT_THEME: Record<Theme, Theme> = {
  light: 'dark',
  dark: 'system',
  system: 'light',
};

export default function ThemeToggle(): JSX.Element {
  // Starts 'system' so server and first client render match (avoids a
  // hydration mismatch on the icon); synced to the real value right after
  // mount.
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    // Legitimate exception to the rule: this syncs from an external system,
    // not state derivable during render. Reading `document` in the
    // initializer would run this same code on the server too and throw, so
    // the sync has to happen post-mount.
    //
    // The attribute is the whole source of truth here. The server stamps it
    // only for an explicit choice, so its absence means 'system' — and in
    // that case globals.css has already resolved the theme via
    // `@media (prefers-color-scheme: dark)`. Nothing needs matchMedia: the
    // icon reports which *mode* is active, not which colors won.
    const attr = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(attr === 'dark' || attr === 'light' ? attr : 'system');
  }, []);

  const cycle = () => {
    const next = NEXT_THEME[theme];

    if (next === 'system') {
      // Removing both the attribute and the cookie hands control back to the
      // media query, live — no reload, and no preference left on record.
      delete document.documentElement.dataset.theme;
      document.cookie = `${THEME_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
    } else {
      document.documentElement.dataset.theme = next;
      document.cookie = `${THEME_COOKIE_NAME}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    }

    setTheme(next);
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Theme: ${theme}. Switch to ${NEXT_THEME[theme]}.`}
      className="min-h-11 min-w-11 text-muted-foreground hover:text-foreground"
    >
      {theme === 'system' ? (
        <MonitorIcon className="size-5" />
      ) : theme === 'dark' ? (
        <MoonIcon className="size-5" />
      ) : (
        <SunIcon className="size-5" />
      )}
    </Button>
  );
}
