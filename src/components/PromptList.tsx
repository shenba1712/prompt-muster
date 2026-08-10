import type { JSX } from 'react';
import { Prompt } from '@/types/prompt';
import PromptCard from './PromptCard';
import EmptyState from './EmptyState';
import styles from './PromptList.module.css';

interface PromptListProps {
  readonly prompts: Prompt[];
  readonly totalCount: number;
  readonly onDelete: (id: string) => void;
  readonly onCopy: (content: string) => void;
  readonly onToggleFavorite: (id: string) => void;
}

export default function PromptList({
  prompts,
  totalCount,
  onDelete,
  onCopy,
  onToggleFavorite,
}: PromptListProps): JSX.Element {
  if (prompts.length === 0) {
    return totalCount === 0 ? (
      <EmptyState />
    ) : (
      <EmptyState message="No prompts match your filters." />
    );
  }

  return (
    <div className={styles.list}>
      {prompts.map((prompt) => (
        <PromptCard
          key={prompt.id}
          prompt={prompt}
          onDelete={onDelete}
          onCopy={onCopy}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
