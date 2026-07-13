'use client';

import { useState, type JSX } from 'react';
import { Prompt } from '@/types/prompt';
import FavoriteButton from '@/components/FavoriteButton';
import styles from './PromptCard.module.css';

interface PromptCardProps {
    prompt: Prompt;
    onEdit: (prompt: Prompt) => void;
    onDelete: (id: string) => void;
    onCopy: (content: string) => void;
    onToggleFavorite: (id: string) => void;
}

const CONTENT_PREVIEW_LIMIT = 120;

export default function PromptCard({
                                       prompt,
                                       onEdit,
                                       onDelete,
                                       onCopy,
                                       onToggleFavorite,
                                   }: PromptCardProps): JSX.Element {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        onCopy(prompt.content);
        // for now, it's set in the button. Ideally, a tooltip.
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const preview = prompt.content.length > CONTENT_PREVIEW_LIMIT
        ? `${prompt.content.slice(0, CONTENT_PREVIEW_LIMIT)}...`
        : prompt.content;

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
                <span className={styles.badge} data-model={prompt.model}>{prompt.model}</span>
                <span className={styles.badge} data-category={prompt.category}>{prompt.category}</span>
            </div>
            <p className={styles.content}>{preview}</p>
            <div className={styles.tags}>
                {prompt.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
            </div>
            <div className={styles.actions}>
                <button onClick={() => onEdit(prompt)}>Edit</button>
                <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy'}</button>
                <button onClick={() => onDelete(prompt.id)}>Delete</button>
            </div>
        </div>
    );
}
