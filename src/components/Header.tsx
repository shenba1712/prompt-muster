import type { JSX } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import styles from '@/components/Header.module.css';

export default function Header(): JSX.Element {
  return (
    <header className={styles.header}>
      <h1>PromptMuster</h1>
      <Link
        href="/prompts/new"
        className={cn(
          buttonVariants({ variant: 'secondary', size: 'lg' }),
          'bg-[var(--brand-contrast)] font-semibold text-[var(--brand)] hover:bg-[#e1f5ee]'
        )}
      >
        Add Prompt
      </Link>
    </header>
  );
}
