// Shared by the root layout (reads it server-side via cookies()) and
// ThemeToggle (writes it client-side via document.cookie) — kept in one
// place so the two sides can't drift out of sync on the cookie name.
export const THEME_COOKIE_NAME = 'theme';

// 'system' is never stored — it *is* the absence of the cookie, which leaves
// globals.css's `@media (prefers-color-scheme: dark)` layer free to resolve
// the theme live on every paint. Writing a concrete value for it would freeze
// whatever the OS happened to be at the moment of the click, turning a
// "follow my OS" state into a stale explicit choice.
export type Theme = 'light' | 'dark' | 'system';
