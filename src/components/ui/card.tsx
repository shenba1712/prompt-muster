import * as React from 'react';
import type { JSX } from 'react';

import { cn } from '@/lib/utils';

type CardProps = React.ComponentProps<'div'>;
type CardHeaderProps = React.ComponentProps<'div'>;
type CardTitleProps = React.ComponentProps<'h3'>;
type CardContentProps = React.ComponentProps<'div'>;
type CardFooterProps = React.ComponentProps<'div'>;

function Card({ className, ...props }: CardProps): JSX.Element {
  return (
    <div
      data-slot="card"
      className={cn(
        // design-system.md §2.6: hover affordance uses the shared motion
        // tokens, not magic numbers. No hover shadow — principle 3 reserves
        // shadow for genuinely transient surfaces (dropdowns, modals), not
        // resting cards, and hover doesn't change that classification.
        'flex flex-col gap-3 rounded-none border border-border bg-card p-4 text-card-foreground transition-all duration-fast ease-standard hover:z-10 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-foreground/20 motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100',
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: CardHeaderProps): JSX.Element {
  return (
    <div
      data-slot="card-header"
      className={cn('flex items-center justify-between gap-2', className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: CardTitleProps): JSX.Element {
  return (
    <h3
      data-slot="card-title"
      className={cn('min-w-0 text-md font-medium break-words', className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: CardContentProps): JSX.Element {
  return (
    <div
      data-slot="card-content"
      className={cn('flex flex-col gap-3', className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: CardFooterProps): JSX.Element {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
