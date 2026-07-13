'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import { CreatePromptInput, Prompt } from '@/types/prompt';
import Header from "@/components/Header";
import PromptList from "@/components/PromptList";
import PromptForm from '@/components/PromptForm';
import PromptFilters from '@/components/PromptFilters';
import { usePromptManager } from '@/hooks/usePromptManager';

type FormState = { mode: 'create' } | { mode: 'edit'; prompt: Prompt };

export default function Home() {
  const [formState, setFormState] = useState<FormState | null>(null);
  const {
    filteredPrompts,
    promptCount,
    filteredPromptCount,
    error,
    addPrompt,
    updatePrompt,
    deletePrompt,
    copyToClipboard,
    toggleFavorite,
    filterState,
    setFilter,
    seedPrompts
  } = usePromptManager();

  const handleSave = (input: CreatePromptInput) => {
    if (formState?.mode === 'edit') {
      updatePrompt(formState.prompt.id, input);
      setFormState(null); // close after saving an edit
    } else {
      addPrompt(input); // create; form stays open for the next entry
    }
  };

  return (
    <div className={styles.page}>
      <Header onOpenForm={() => setFormState({ mode: 'create' })} />
      <main className={styles.main}>
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {/*test data. should be removed when persistence is added*/}
        <button onClick={seedPrompts}>Load Sample Data</button>

        <PromptFilters
            filterState={filterState}
            onFilterChange={setFilter}
            totalCount={promptCount}
            filteredCount={filteredPromptCount}
        />

        {formState && (
          <PromptForm
            key={formState.mode === 'edit' ? formState.prompt.id : 'new'}
            prompt={formState.mode === 'edit' ? formState.prompt : undefined}
            onSave={handleSave}
            onCancel={() => setFormState(null)}
          />
        )}

        <PromptList
          prompts={filteredPrompts}
          totalCount={promptCount}
          onEdit={(prompt) => setFormState({ mode: 'edit', prompt })}
          onDelete={deletePrompt}
          onCopy={copyToClipboard}
          onToggleFavorite={toggleFavorite}
        />
      </main>
    </div>
  );
}
