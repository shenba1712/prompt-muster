import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Geist, Geist_Mono, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { THEME_COOKIE_NAME } from '@/lib/theme';
import PromptProvider from '@/context/PromptProvider';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PromptMuster',
  description: 'Your Github for Prompts',
};

// Next resolves metadata independently of which component tree renders, so
// this survives onto the `notFound()` boundary's `<html id="__next_error__">`
// shell — where the layout never renders, no stylesheet is applied (the CSS
// ships as `rel="preload"` only, which fetches but does not apply it), and the
// body is empty until hydration. This tag is the only thing that reaches that
// shell, so it decides the canvas colour of the blank first paint.
//
// `color-scheme` is a *list of supported schemes*, not a ranking: the browser
// takes the user's OS preference if it appears in the list, else the first
// entry. So omitting a scheme is what forces one. With no cookie we offer
// both and let the OS decide; with an explicit choice we offer only that one,
// which is how a light-OS visitor who picked dark still gets a dark canvas.
//
// Reading cookies() here opts the whole app out of static rendering — free in
// this app, since the root layout below already reads them and every route is
// data-backed anyway.
export async function generateViewport(): Promise<Viewport> {
  const cookieStore = await cookies();
  const theme = cookieStore.get(THEME_COOKIE_NAME)?.value;

  return {
    colorScheme:
      theme === 'dark' ? 'dark' : theme === 'light' ? 'light' : 'light dark',
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get(THEME_COOKIE_NAME)?.value;
  // Only an explicit choice (from the toggle) sets this attribute at all.
  // With no cookie, the attribute is omitted entirely and globals.css's
  // `@media (prefers-color-scheme: dark)` layer resolves the theme live, in
  // CSS, on every paint — no script needed to detect or apply it, and
  // nothing for hydration to reconcile since server and client agree on
  // "no attribute" from the very first render.
  const theme =
    cookieTheme === 'dark' || cookieTheme === 'light' ? cookieTheme : undefined;

  return (
    <html
      lang="en"
      data-theme={theme}
      className={cn(
        geistSans.variable,
        geistMono.variable,
        'font-mono',
        jetbrainsMono.variable
      )}
    >
      <body>
        <PromptProvider>{children}</PromptProvider>
      </body>
    </html>
  );
}
