'use client';

import { startTransition, use, type JSX } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import FavoriteButton from '@/components/FavoriteButton';
import PromptBadges from '@/components/PromptBadges';
import PromptTags from '@/components/PromptTags';
import PromptActions from '@/components/PromptActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePrompts } from '@/context/PromptProvider';

interface PromptDetailPageProps {
  // Next 16: route params arrive as a Promise, unwrapped with React's use().
  params: Promise<{ id: string }>;
}

export default function PromptDetailPage({
  params,
}: PromptDetailPageProps): JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const { prompts, toggleFavorite, deletePrompt, copyToClipboard } =
    usePrompts();

  const prompt = prompts.find((p) => p.id === id);

  if (!prompt) {
    notFound();
  }

  const handleDelete = (deletedId: string) => {
    // Deleting the prompt we're currently viewing — unlike the list (where
    // the card just disappears in place), this page has nothing left to
    // show. router.push() alone races the context update: deletePrompt's
    // setPrompts is an urgent update, so this page can re-render (prompt ->
    // undefined -> notFound()) and strand the transition-priority navigation
    // on the old URL before it commits. Wrapping both in startTransition
    // gives them the same priority so the navigation isn't preempted.
    startTransition(() => {
      router.push('/prompts');
      deletePrompt(deletedId);
    });
  };

  return (
    <>
      <Link
        href="/prompts"
        className="rounded-none text-sm text-muted-foreground outline-none hover:text-foreground hover:underline focus-visible:ring-1 focus-visible:ring-ring/50"
      >
        ← Back to prompts
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{prompt.title}</CardTitle>
          <FavoriteButton
            isFavorite={prompt.isFavorite}
            onToggle={() => toggleFavorite(prompt.id)}
          />
        </CardHeader>
        <CardContent>
          <PromptBadges model={prompt.model} category={prompt.category} />
          <PromptTags tags={prompt.tags} />

          {/* Full content here, unlike the card's 120-char preview. */}
          <p className="text-sm whitespace-pre-wrap">{prompt.content}</p>

          <p className="text-xs text-muted-foreground tabular-nums">
            Created {prompt.createdAt.toLocaleDateString()}
          </p>
        </CardContent>
        <PromptActions
          promptId={prompt.id}
          promptTitle={prompt.title}
          content={prompt.content}
          onCopy={copyToClipboard}
          onDelete={handleDelete}
        />
      </Card>
    </>
  );
}
