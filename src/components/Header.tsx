import type { JSX } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/components/Header.module.css';

export default function Header(): JSX.Element {
  return (
    <header className={styles.header}>
      <h1>PromptMuster</h1>
      <div className="flex items-center gap-2">
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
