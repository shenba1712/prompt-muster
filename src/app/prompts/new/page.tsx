'use client';

import type { JSX } from 'react';
import { useRouter } from 'next/navigation';
import { CreatePromptInput } from '@/types/prompt';
import Header from '@/components/Header';
import PromptForm from '@/components/PromptForm';
import { usePrompts } from '@/context/PromptProvider';
import styles from '../page.module.css';

export default function NewPromptPage(): JSX.Element {
  const router = useRouter();
  const { addPrompt } = usePrompts();

  const handleSave = (input: CreatePromptInput) => {
    const newPrompt = addPrompt(input);
    router.push(`/prompts/${newPrompt.id}`);
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <PromptForm
          onSave={handleSave}
          onCancel={() => router.push('/prompts')}
        />
      </main>
    </div>
  );
}
