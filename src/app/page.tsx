'use client';

import { useState } from 'react';
import styles from "./page.module.css";
import Header from "@/components/Header";
import PromptList from "@/components/PromptList";
import PromptForm from '@/components/PromptForm';
import PromptFilters from '@/components/PromptFilters';
import { usePromptManager } from '@/hooks/usePromptManager';

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {
    filteredPrompts,
    promptCount,
    filteredPromptCount,
    error,
    addPrompt,
    deletePrompt,
    copyToClipboard,
    toggleFavorite,
    filterState,
    setFilter
  } = usePromptManager();

  return (
    <div className={styles.page}>
      <Header onOpenForm={() => setIsFormOpen(true)} />
      <main className={styles.main}>
        {error && <p role="alert" className={styles.error}>{error}</p>}

        <PromptFilters
            filterState={filterState}
            onFilterChange={setFilter}
            totalCount={promptCount}
            filteredCount={filteredPromptCount}
        />

        {isFormOpen && (
          <PromptForm
            onAddPrompt={addPrompt}
            onCancel={() => setIsFormOpen(false)}
          />
        )}

        <PromptList
          prompts={filteredPrompts}
          totalCount={promptCount}
          onDelete={deletePrompt}
          onCopy={copyToClipboard}
          onToggleFavorite={toggleFavorite}
        />
      </main>
    </div>
  );
}
