import type { JSX } from 'react';
import { Badge } from '@/components/ui/badge';

interface PromptTagsProps {
  tags: string[];
}

export default function PromptTags({
  tags,
}: PromptTagsProps): JSX.Element | null {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  );
}
