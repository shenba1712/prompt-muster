import type { JSX } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import styles from './Header.module.css';

export default function Header(): JSX.Element {
  return (
    <header className={styles.header}>
      <h1>
        <Link
          href="/prompts"
          className="rounded-none text-inherit no-underline outline-none focus-visible:ring-1 focus-visible:ring-ring/50"
        >
          PromptMuster
        </Link>
      </h1>
      <div className="flex items-center gap-2">
        <Link
          href="/settings"
          className={buttonVariants({ variant: 'ghost', size: 'lg' })}
        >
          Settings
        </Link>
        <ThemeToggle />
        <Link
          href="/prompts/new"
          className={buttonVariants({ variant: 'default', size: 'lg' })}
        >
          Add Prompt
        </Link>
      </div>
    </header>
  );
}
