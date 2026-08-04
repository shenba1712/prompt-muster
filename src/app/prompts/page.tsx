'use client';

import type { JSX } from 'react';
import styles from './page.module.css';
import PromptList from '@/components/PromptList';
import PromptFilters from '@/components/PromptFilters';
import { Button } from '@/components/ui/button';
import { usePrompts } from '@/context/PromptProvider';

export default function PromptsPage(): JSX.Element {
  const {
    filteredPrompts,
    promptCount,
    filteredPromptCount,
    error,
    deletePrompt,
    copyToClipboard,
    toggleFavorite,
    filterState,
    setFilter,
    seedPrompts,
  } = usePrompts();

  return (
    <>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {/*test data. should be removed when persistence is added*/}
      <Button type="button" variant="outline" onClick={seedPrompts}>
        Load Sample Data
      </Button>

      <PromptFilters
        filterState={filterState}
        onFilterChange={setFilter}
        totalCount={promptCount}
        filteredCount={filteredPromptCount}
      />

      <PromptList
        prompts={filteredPrompts}
        totalCount={promptCount}
        onDelete={deletePrompt}
        onCopy={copyToClipboard}
        onToggleFavorite={toggleFavorite}
      />
    </>
  );
}
