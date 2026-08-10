'use client';

import type { JSX } from 'react';
import { StarIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  readonly isFavorite: boolean;
  readonly onToggle: () => void;
}

export default function FavoriteButton({
  isFavorite,
  onToggle,
}: FavoriteButtonProps): JSX.Element {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      className="min-h-11 min-w-11 text-muted-foreground hover:text-foreground"
    >
      <StarIcon
        weight={isFavorite ? 'fill' : 'regular'}
        className={cn('size-5', isFavorite && 'text-favorite')}
      />
    </Button>
  );
}
