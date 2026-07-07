'use client';

import { useState } from 'react';
import { Model, Category } from '@/types/prompt';
import { MODEL_OPTIONS, CATEGORY_OPTIONS } from '@/utils/prompt';
import styles from './PromptForm.module.css';

interface PromptFormProps {
    onAddPrompt: (
        title: string,
        content: string,
        model: Model,
        category: Category,
        tags: string[]
    ) => void;
}

export default function PromptForm({ onAddPrompt }: PromptFormProps) {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [model, setModel] = useState<Model>(MODEL_OPTIONS[0]);
    const [category, setCategory] = useState<Category>(CATEGORY_OPTIONS[0]);
    const [tags, setTags] = useState('');

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) return;
        onAddPrompt(
            title.trim(),
            content.trim(),
            model,
            category,
            tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        );
        setTitle('');
        setContent('');
        setModel(MODEL_OPTIONS[0]);
        setCategory(CATEGORY_OPTIONS[0]);
        setTags('');
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <input
                type="text"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                }
                placeholder="Prompt title"
            />
            <textarea
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                }
                placeholder="Prompt content"
            />
            <div className={styles.row}>
                <select
                    value={model}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setModel(e.target.value as Model)
                    }
                >
                    {MODEL_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <select
                    value={category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setCategory(e.target.value as Category)
                    }
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
            />
            <div className={styles.actions}>
                <button type="submit">Add Prompt</button>
            </div>
        </form>
    );
}