'use client';

import styles from "./page.module.css";
import Header from "@/components/Header";
import PromptList from "@/components/PromptList";
import PromptForm from '@/components/PromptForm';
import { usePromptManager } from '@/hooks/usePromptManager';

export default function Home() {
  const {
    prompts,
    promptCount,
    copyError,
    addPrompt,
    deletePrompt,
    copyToClipboard,
    toggleFavorite,
  } = usePromptManager();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Header onAddPrompt={addPrompt} promptCount={promptCount} />
        {copyError && <p role="alert" className={styles.error}>{copyError}</p>}
        <br/>

        {/*For now, the form is directly pasted here. Ideally, should be connected to the button in the header*/}
        <div>
          <PromptForm onAddPrompt={addPrompt} />
        </div>
        <br/>

        <PromptList
          prompts={prompts}
          onDelete={deletePrompt}
          onCopy={copyToClipboard}
          onToggleFavorite={toggleFavorite}
        />
      </main>
    </div>
  );
}
