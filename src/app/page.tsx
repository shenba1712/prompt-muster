'use client';

import styles from "./page.module.css";
import Header from "@/components/Header";
import PromptList from "@/components/PromptList";
import PromptForm from '@/components/PromptForm';
import PromptFilters from '@/components/PromptFilters';
import { usePromptManager } from '@/hooks/usePromptManager';

export default function Home() {
  const {
    prompts,
    filteredPrompts,
    promptCount,
    filteredPromptCount,
    copyError,
    addPrompt,
    deletePrompt,
    copyToClipboard,
    toggleFavorite,
    filterState,
    setFilter
  } = usePromptManager();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Header onAddPrompt={addPrompt} promptCount={promptCount} filteredPromptCount={filteredPromptCount} />
        {copyError && <p role="alert" className={styles.error}>{copyError}</p>}
        <br/>

        {/*For now, the form is directly pasted here. Ideally, should be connected to a button */}
        <PromptFilters
            filterState={filterState}
            onFilterChange={setFilter}
            totalCount={promptCount}
            filteredCount={filteredPromptCount}
        />

        {/*For now, the form is directly pasted here. Ideally, should be connected to the button in the header*/}
        <div>
          <PromptForm onAddPrompt={addPrompt} />
        </div>
        <br/>

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
