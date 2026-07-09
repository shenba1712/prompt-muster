'use client';

import { useState, useRef, type JSX } from 'react';
import { Model, Category, MODEL_OPTIONS, CATEGORY_OPTIONS, CreatePromptInput } from '@/types/prompt';
import { isModel, isCategory } from '@/utils/prompt';
import styles from './PromptForm.module.css';

interface PromptFormProps {
    onAddPrompt: (input: CreatePromptInput) => void;
    onCancel: () => void;
}

export default function PromptForm({ onAddPrompt, onCancel }: PromptFormProps): JSX.Element {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [model, setModel] = useState<Model>(MODEL_OPTIONS[0]);
    const [category, setCategory] = useState<Category>(CATEGORY_OPTIONS[0]);
    const [tags, setTags] = useState('');
    const titleInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        const seenTags = new Set<string>();
        const uniqueTags = tags
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .filter(tag => {
                const key = tag.toLowerCase();
                if (seenTags.has(key)) return false;
                seenTags.add(key);
                return true;
            });
        onAddPrompt({
            title: title.trim(),
            content: content.trim(),
            model,
            category,
            tags: uniqueTags,
        });
        setTitle('');
        setContent('');
        setModel(MODEL_OPTIONS[0]);
        setCategory(CATEGORY_OPTIONS[0]);
        setTags('');
        titleInputRef.current?.focus();
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                }
                placeholder="Prompt title"
                aria-label="Prompt title"
            />
            <textarea
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                }
                placeholder="Prompt content"
                aria-label="Prompt content"
            />
            <div className={styles.row}>
                <select
                    value={model}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const value = e.target.value;
                        if (isModel(value)) setModel(value);
                    }}
                    aria-label="Model"
                >
                    {MODEL_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <select
                    value={category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const value = e.target.value;
                        if (isCategory(value)) setCategory(value);
                    }}
                    aria-label="Category"
                >
                    {CATEGORY_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            </div>
            <input
                type="text"
                value={tags}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTags(e.target.value)
                }
                placeholder="Tags (comma-separated)"
                aria-label="Tags (comma-separated)"
            />
            <div className={styles.actions}>
                <button type="button" onClick={onCancel}>Cancel</button>
                <button type="submit">Add Prompt</button>
            </div>
        </form>
    );
}