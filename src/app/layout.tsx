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
