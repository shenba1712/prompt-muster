import type { JSX } from 'react';
import { Category, Model } from '@/types/prompt';
import ModelBadge from '@/components/ModelBadge';
import { Badge } from '@/components/ui/badge';

interface PromptBadgesProps {
  readonly model: Model;
  readonly category: Category;
}

export default function PromptBadges({
  model,
  category,
}: PromptBadgesProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2">
      <ModelBadge model={model} />
      <Badge variant="secondary">{category}</Badge>
    </div>
  );
}
