'use client';

import { use, type JSX } from 'react';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ModelBadge from '@/components/ModelBadge';
import FavoriteButton from '@/components/FavoriteButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePrompts } from '@/context/PromptProvider';
import styles from '../page.module.css';

interface PromptDetailPageProps {
  // Next 16: route params arrive as a Promise, unwrapped with React's use().
  params: Promise<{ id: string }>;
}

export default function PromptDetailPage({
  params,
}: PromptDetailPageProps): JSX.Element {
  const { id } = use(params);
  const router = useRouter();
  const { prompts, toggleFavorite } = usePrompts();

  const prompt = prompts.find((p) => p.id === id);

  if (!prompt) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Header onOpenForm={() => router.push('/prompts')} />
      <main className={styles.main}>
        <Link
          href="/prompts"
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
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
            <div className="flex flex-wrap gap-2">
              <ModelBadge model={prompt.model} />
              <Badge variant="secondary">{prompt.category}</Badge>
            </div>

            {prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {prompt.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Full content here, unlike the card's 120-char preview. */}
            <p className="text-sm whitespace-pre-wrap">{prompt.content}</p>

            <p className="text-xs text-muted-foreground tabular-nums">
              Created {prompt.createdAt.toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
