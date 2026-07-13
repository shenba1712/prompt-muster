import type { JSX } from 'react';
import { Prompt } from '@/types/prompt';
import PromptCard from './PromptCard';
import EmptyState from './EmptyState';
import styles from './PromptList.module.css';

interface PromptListProps {
    prompts: Prompt[];
    totalCount: number;
    onEdit: (prompt: Prompt) => void;
    onDelete: (id: string) => void;
    onCopy: (content: string) => void;
    onToggleFavorite: (id: string) => void;
}

export default function PromptList({
                                        prompts,
                                        totalCount,
                                        onEdit,
                                        onDelete,
                                        onCopy,
                                        onToggleFavorite,
                                    }: PromptListProps): JSX.Element {
    if (prompts.length === 0) {
        return totalCount === 0
            ? <EmptyState />
            : <EmptyState message="No prompts match your filters." />;
    }

    return (
        <div className={styles.list}>
            {prompts.map(prompt => (
                <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onCopy={onCopy}
                    onToggleFavorite={onToggleFavorite}
                />
            ))}
        </div>
    );
}
