import type { JSX } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  message?: string;
}

export default function EmptyState({
  message = 'No prompts yet. Create your first prompt to get started.',
}: EmptyStateProps): JSX.Element {
  return (
    <div className={styles.empty}>
      <div>{message}</div>
    </div>
  );
}
