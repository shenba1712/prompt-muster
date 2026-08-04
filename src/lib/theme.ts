// Shared by the root layout (reads it server-side via cookies()) and
// ThemeToggle (writes it client-side via document.cookie) — kept in one
// place so the two sides can't drift out of sync on the cookie name.
export const THEME_COOKIE_NAME = 'theme';
