'use client';

import { Suspense, type JSX } from 'react';
import styles from './page.module.css';
import PromptList from '@/components/PromptList';
import PromptFilters from '@/components/PromptFilters';
import { Button } from '@/components/ui/button';
import { usePrompts } from '@/context/PromptProvider';
import { useFilterParams } from '@/hooks/useFilterParams';
import { filterPrompts } from '@/utils/filter-prompts';

function PromptsPageContent(): JSX.Element {
  const {
    prompts,
    promptCount,
    error,
    deletePrompt,
    copyToClipboard,
    toggleFavorite,
    seedPrompts,
  } = usePrompts();

  const { filterState, setFilter } = useFilterParams();

  const filteredPrompts = filterPrompts(prompts, filterState);
  const filteredPromptCount = filteredPrompts.length;

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

export default function PromptsPage(): JSX.Element {
  // useFilterParams() calls useSearchParams() internally, which opts this
  // subtree out of static rendering unless it's wrapped in Suspense —
  // fallback is null since this page is already fully client-rendered with
  // no real network wait to cover.
  return (
    <Suspense fallback={null}>
      <PromptsPageContent />
    </Suspense>
  );
}
