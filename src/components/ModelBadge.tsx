import type { JSX } from 'react';
import { Model } from '@/types/prompt';
import { getModelProvider } from '@/utils/prompt';
import { Badge } from '@/components/ui/badge';

interface ModelBadgeProps {
  model: Model;
}

// Provider decides the badge treatment, not the model string: only
// OpenAI/Anthropic have a validated filled color (design-system.md §2.1),
// everything else renders outlined.
export default function ModelBadge({ model }: ModelBadgeProps): JSX.Element {
  const provider = getModelProvider(model);
  const variant =
    provider === 'openai'
      ? 'openai'
      : provider === 'anthropic'
        ? 'anthropic'
        : 'outline';

  return <Badge variant={variant}>{model}</Badge>;
}
