'use client';

import { useState } from 'react';
import { Prompt, Model, Category } from '@/types/prompt';
import styles from "./page.module.css";
import Header from "@/components/Header";
import PromptList from "@/components/PromptList";
import PromptForm from '@/components/PromptForm';

export default function Home() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [copyError, setCopyError] = useState<string | null>(null);

  const addPrompt = (
      title: string,
      content: string,
      model: Model,
      category: Category,
      tags: string[]
  ) => {
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      title,
      content,
      model,
      category,
      tags,
      isFavorite: false,
      createdAt: new Date(),
    };
    setPrompts(prev => [newPrompt, ...prev]);
  };

  const handleDelete = (id: string) => {
    setPrompts(prev => prev.filter(p => p.id !== id));
  };

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyError(null);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to copy prompt to clipboard.';
      setCopyError(message);
    }
  };

  const handleToggleFavorite = (id: string) => {
    setPrompts(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Header onAddPrompt={addPrompt} promptCount={prompts.length} />
        {copyError && <p role="alert" className={styles.error}>{copyError}</p>}
        <br/>

        {/*For now, the form is directly pasted here. Ideally, should be connected to the button in the header*/}
        <div>
          <PromptForm onAddPrompt={addPrompt} />
        </div>
        <br/>

        <PromptList
          prompts={prompts}
          onDelete={handleDelete}
          onCopy={handleCopy}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>
    </div>
  );
}
