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
      {/* Dev-only affordance — there's no persistence yet, so this is how
          the app gets test data locally. Gated out of production builds;
          Next's bundler strips this block entirely when NODE_ENV is
          'production', so it never ships. */}
      {process.env.NODE_ENV !== 'production' && (
        <Button type="button" variant="outline" onClick={seedPrompts}>
          Load Sample Data
        </Button>
      )}

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
