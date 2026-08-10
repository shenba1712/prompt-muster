'use client';

import { use, type JSX } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { CreatePromptInput } from '@/types/prompt';
import PromptForm from '@/components/PromptForm';
import { usePrompts } from '@/context/PromptProvider';

interface EditPromptPageProps {
  // Next 16: route params arrive as a Promise, unwrapped with React's use().
  readonly params: Promise<{ id: string }>;
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
    <PromptForm
      prompt={prompt}
      onSave={handleSave}
      onCancel={() => router.push(`/prompts/${prompt.id}`)}
    />
  );
}
