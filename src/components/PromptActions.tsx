'use client';

import { useState, type JSX } from 'react';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog';

interface PromptActionsProps {
  promptId: string;
  promptTitle: string;
  content: string;
  onCopy: (content: string) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export default function PromptActions({
  promptId,
  promptTitle,
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
      <DeleteConfirmDialog
        promptTitle={promptTitle}
        onConfirm={() => onDelete(promptId)}
      />
    </CardFooter>
  );
}
