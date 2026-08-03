'use client';

import { useState, type JSX } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PromptActionsProps {
  promptId: string;
  content: string;
  onCopy: (content: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export default function PromptActions({
  promptId,
  content,
  onCopy,
  onDelete,
  className,
}: PromptActionsProps): JSX.Element {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(content);
    // for now, it's set in the button. Ideally, a tooltip.
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <CardFooter className={cn('justify-end', className)}>
      <Link
        href={`/prompts/${promptId}/edit`}
        className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
      >
        Edit
      </Link>
      <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
        {copied ? 'Copied!' : 'Copy'}
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        onClick={() => onDelete(promptId)}
      >
        Delete
      </Button>
    </CardFooter>
  );
}
