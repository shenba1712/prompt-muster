'use client';

import { useState, type JSX } from 'react';
import Link from 'next/link';
import { Prompt } from '@/types/prompt';
import FavoriteButton from '@/components/FavoriteButton';
import ModelBadge from '@/components/ModelBadge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onCopy: (content: string) => void;
  onToggleFavorite: (id: string) => void;
}

const CONTENT_PREVIEW_LIMIT = 120;

export default function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onCopy,
  onToggleFavorite,
}: PromptCardProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(prompt.content);
    // for now, it's set in the button. Ideally, a tooltip.
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
        <div className="flex flex-wrap gap-2">
          <ModelBadge model={prompt.model} />
          <Badge variant="secondary">{prompt.category}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{preview}</p>
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {prompt.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="relative z-10">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(prompt)}
        >
          Edit
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onDelete(prompt.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
