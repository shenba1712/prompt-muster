'use client';

import type { JSX } from 'react';
import Link from 'next/link';
import { Prompt } from '@/types/prompt';
import FavoriteButton from '@/components/FavoriteButton';
import PromptBadges from '@/components/PromptBadges';
import PromptTags from '@/components/PromptTags';
import PromptActions from '@/components/PromptActions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PromptCardProps {
  prompt: Prompt;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
}

const CONTENT_PREVIEW_LIMIT = 120;

export default function PromptCard({
  prompt,
  onDelete,
  onCopy,
  onToggleFavorite,
}: PromptCardProps): JSX.Element {
  const preview =
    prompt.content.length > CONTENT_PREVIEW_LIMIT
      ? `${prompt.content.slice(0, CONTENT_PREVIEW_LIMIT)}...`
      : prompt.content;

  return (
    <Card className="relative">
      <CardHeader>
        <CardTitle>
          <Link
            href={`/prompts/${prompt.id}`}
            className="after:absolute after:inset-0 hover:underline"
          >
            {prompt.title}
          </Link>
        </CardTitle>
        <div className="relative z-10">
          <FavoriteButton
            isFavorite={prompt.isFavorite}
            onToggle={() => onToggleFavorite(prompt.id)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <PromptBadges model={prompt.model} category={prompt.category} />
        <p className="text-sm text-muted-foreground">{preview}</p>
        <PromptTags tags={prompt.tags} />
      </CardContent>
      <PromptActions
        promptId={prompt.id}
        content={prompt.content}
        onCopy={onCopy}
        onDelete={onDelete}
        className="relative z-10"
      />
    </Card>
  );
}
