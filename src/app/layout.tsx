import type { Metadata } from 'next';
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

// Runs only on a first-ever visit, before the theme cookie exists — the
// server can't know the OS preference (that's a client-only API), so it
// renders light and this corrects it once and writes the cookie so every
// future request, on any route, gets the right class straight from the
// server via the cookies() read below. No inline script or client effect is
// involved in the steady state, so there's nothing that can fail to execute
// on Next's notFound() boundary (which drops <head> scripts) — the class is
// just a normal server-rendered attribute there, same as `lang="en"`.
const bootstrapThemeScript = `
(function () {
  try {
    if (document.cookie.indexOf('${THEME_COOKIE_NAME}=') !== -1) return;
    var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark);
    document.cookie = '${THEME_COOKIE_NAME}=' + (isDark ? 'dark' : 'light') + '; path=/; max-age=31536000; SameSite=Lax';
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isDark = cookieStore.get(THEME_COOKIE_NAME)?.value === 'dark';

  return (
    <html
      lang="en"
      // Only matters for the first-ever-visit bootstrap case above, where
      // the client script may flip the class after this server render.
      suppressHydrationWarning
      className={cn(
        isDark && 'dark',
        geistSans.variable,
        geistMono.variable,
        'font-mono',
        jetbrainsMono.variable
      )}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrapThemeScript }} />
      </head>
      <body>
        <PromptProvider>{children}</PromptProvider>
      </body>
    </html>
  );
}
