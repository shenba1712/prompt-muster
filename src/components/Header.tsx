import type { JSX } from 'react';
import { Button } from '@/components/ui/button';
import styles from '@/components/Header.module.css';

interface HeaderProps {
  onOpenForm: () => void;
}

export default function Header({ onOpenForm }: HeaderProps): JSX.Element {
  return (
    <header className={styles.header}>
      <h1>PromptMuster</h1>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        onClick={onOpenForm}
        className="bg-[var(--brand-contrast)] font-semibold text-[var(--brand)] hover:bg-[#e1f5ee]"
      >
        Add Prompt
      </Button>
    </header>
  );
}
