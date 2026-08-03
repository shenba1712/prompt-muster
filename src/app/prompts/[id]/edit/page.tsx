'use client';

import { use, type JSX } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { CreatePromptInput } from '@/types/prompt';
import Header from '@/components/Header';
import PromptForm from '@/components/PromptForm';
import { usePrompts } from '@/context/PromptProvider';
import styles from '../../page.module.css';

interface EditPromptPageProps {
  // Next 16: route params arrive as a Promise, unwrapped with React's use().
  params: Promise<{ id: string }>;
}

export default function EditPromptPage({
  params,
}: EditPromptPageProps): JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const { prompts, updatePrompt } = usePrompts();

  const prompt = prompts.find((p) => p.id === id);

  if (!prompt) {
    notFound();
  }

  const handleSave = (input: CreatePromptInput) => {
    updatePrompt(prompt.id, input);
    router.push(`/prompts/${prompt.id}`);
  };

  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <PromptForm
          prompt={prompt}
          onSave={handleSave}
          onCancel={() => router.push(`/prompts/${prompt.id}`)}
        />
      </main>
    </div>
  );
}
