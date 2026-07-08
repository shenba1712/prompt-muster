'use client';

import type { JSX } from 'react';
import { Prompt } from '@/types/prompt';
import FavoriteButton from '@/components/FavoriteButton';
import styles from './PromptCard.module.css';

interface PromptCardProps {
    prompt: Prompt;
    onDelete: (id: string) => void;
    onCopy: (content: string) => void;
    onToggleFavorite: (id: string) => void;
}

export default function PromptCard({
                                       prompt,
                                       onDelete,
                                       onCopy,
                                       onToggleFavorite,
                                   }: PromptCardProps): JSX.Element {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3>{prompt.title}</h3>
                <FavoriteButton
                    isFavorite={prompt.isFavorite}
                    onToggle={() => onToggleFavorite(prompt.id)}
                />
            </div>
            <div className={styles.badges}>
                <span className={styles.badge}>{prompt.model}</span>
                <span className={styles.badge}>{prompt.category}</span>
            </div>
            <p className={styles.content}>{prompt.content.slice(0, 120)}...</p>
            <div className={styles.tags}>
                {prompt.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
            </div>
            <div className={styles.actions}>
                <button onClick={() => onCopy(prompt.content)}>Copy</button>
                <button onClick={() => onDelete(prompt.id)}>Delete</button>
            </div>
        </div>
    );
}