import type { JSX } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
          className={cn(
            buttonVariants({ variant: 'secondary', size: 'lg' }),
            'bg-[var(--brand-contrast)] font-semibold text-[var(--brand)] hover:bg-[#e1f5ee]'
          )}
        >
          Add Prompt
        </Link>
      </div>
    </header>
  );
}
