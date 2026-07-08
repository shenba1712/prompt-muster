import type { JSX } from 'react';
import { Prompt } from '@/types/prompt';
import PromptCard from './PromptCard';
import EmptyState from './EmptyState';

interface PromptListProps {
    prompts: Prompt[];
    onDelete: (id: string) => void;
    onCopy: (content: string) => void;
    onToggleFavorite: (id: string) => void;
}

export default function PromptList({
                                        prompts,
                                        onDelete,
                                        onCopy,
                                        onToggleFavorite,
                                    }: PromptListProps): JSX.Element {
    if (prompts.length === 0) {
        return <EmptyState />;
    }

    return (
        <div>
            {prompts.map(prompt => (
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
