'use client';

import { useEffect, useState, type JSX } from 'react';
import { MoonIcon, SunIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { THEME_COOKIE_NAME } from '@/lib/theme';

export default function ThemeToggle(): JSX.Element {
  // Starts false so server and first client render match (avoids a
  // hydration mismatch on the icon); synced to the real value — already
  // set server-side from the theme cookie, before this ever mounts — right
  // after mount.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Legitimate exception to the rule: this syncs from an external system
    // (the class the server already set on <html> from the cookie), not
    // mirroring state that's derivable during render — reading `document`
    // in the initializer would run this same code on the server too and
    // throw, so the sync has to happen post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
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
      // Ghost variant sets no text color of its own, and this sits directly
      // on the header's dark brand gradient (no fill) — needs the same
      // explicit brand-contrast override Header.module.css gives the h1,
      // or the icon inherits the dark default foreground and disappears.
      className="min-h-11 min-w-11 text-[var(--brand-contrast)] hover:text-foreground"
    >
      {isDark ? (
        <SunIcon className="size-5" />
      ) : (
        <MoonIcon className="size-5" />
      )}
    </Button>
  );
}
