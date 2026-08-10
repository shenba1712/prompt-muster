'use client';

import { useEffect, useState, type JSX } from 'react';
import {
  MonitorIcon,
  MoonIcon,
  SunIcon,
  type Icon as PhosphorIcon,
} from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import {
  Menu,
  MenuContent,
  MenuRadioGroup,
  MenuRadioItem,
  MenuTrigger,
} from '@/components/ui/menu';
import { THEME_COOKIE_NAME, type Theme } from '@/lib/theme';

const THEME_OPTIONS: readonly Theme[] = ['light', 'dark', 'system'];

// The trigger's icon and each menu row share one lookup — current theme, not
// a "next" destination, since picking directly from a list replaces the old
// cycle-through-states design entirely.
const THEME_ICON: Record<Theme, PhosphorIcon> = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
};

const THEME_LABEL: Record<Theme, string> = {
  light: 'light',
  dark: 'dark',
  system: 'system',
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
    // `@media (prefers-color-scheme: dark)`.
    const attr = document.documentElement.dataset.theme;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(attr === 'dark' || attr === 'light' ? attr : 'system');
  }, []);

  const applyTheme = (next: Theme): void => {
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

  const TriggerIcon = THEME_ICON[theme];

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Theme: ${theme}. Open theme menu.`}
            className="min-h-11 min-w-11 text-muted-foreground hover:text-foreground"
          >
            {/* design-system.md §2.6: each icon is a distinct mounted
                element (not a shared one with a swapped prop), so
                @starting-style's `starting:` variant fires on every swap —
                a real fade/scale-in on the newly mounted icon, not an
                instant pop. */}
            <TriggerIcon className="size-5 transition-[opacity,transform] duration-base ease-standard starting:scale-90 starting:opacity-0" />
          </Button>
        }
      />
      <MenuContent>
        {/* Command-palette flavor, not a functional prompt — the caret is
            decorative only, matching the app's git-native/CLI identity
            rather than looking like a stock dropdown. */}
        <div className="flex items-center gap-1 border-b border-border px-2.5 py-1.5 text-xs text-muted-foreground">
          $ theme
          <span
            aria-hidden="true"
            className="ml-0.5 h-3 w-1.5 animate-pulse bg-primary"
          />
        </div>
        <MenuRadioGroup
          value={theme}
          onValueChange={(value) => applyTheme(value as Theme)}
        >
          {THEME_OPTIONS.map((option) => {
            const OptionIcon = THEME_ICON[option];
            return (
              <MenuRadioItem key={option} value={option} closeOnClick>
                <OptionIcon className="size-4" />
                {THEME_LABEL[option]}
              </MenuRadioItem>
            );
          })}
        </MenuRadioGroup>
      </MenuContent>
    </Menu>
  );
}
