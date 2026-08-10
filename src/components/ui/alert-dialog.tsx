'use client';

import * as React from 'react';
import { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
import type { BaseUIEvent } from '@base-ui/react/types';

import { cn } from '@/lib/utils';

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogClose = AlertDialogPrimitive.Close;

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function AlertDialogContent({
  className,
  initialFocus,
  onKeyDown,
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  initialFocus?: React.RefObject<HTMLElement | null>;
}) {
  const popupRef = React.useRef<HTMLDivElement>(null);

  // Base UI's own focus trap renders guard sentinels, but Tab from the last
  // element doesn't reliably redirect back into the popup in this app's
  // setup — confirmed both live and via a real-DOM RTL test, not assumed.
  // This is a deliberate belt-and-suspenders trap on top of it: a
  // destructive-action confirm must never leak keyboard focus into the page
  // behind it.
  const handleKeyDown = (
    event: BaseUIEvent<React.KeyboardEvent<HTMLDivElement>>
  ) => {
    onKeyDown?.(event);
    if (event.key !== 'Tab' || !popupRef.current) {
      return;
    }

    const focusable = Array.from(
      popupRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    );
    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Backdrop
        data-slot="alert-dialog-backdrop"
        className="fixed inset-0 z-50 bg-foreground/50 duration-slow ease-standard data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
      />
      <AlertDialogPrimitive.Popup
        data-slot="alert-dialog-content"
        ref={popupRef}
        initialFocus={initialFocus}
        onKeyDown={handleKeyDown}
        className={cn(
          // design-system.md §2.6: dialog/modal open maps to --duration-slow.
          'fixed top-1/2 left-1/2 z-50 grid w-full max-w-md -translate-x-1/2 -translate-y-1/2 gap-4 rounded-none border border-border bg-popover p-6 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-slow ease-standard data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
          className
        )}
        {...props}
      />
    </AlertDialogPrimitive.Portal>
  );
}

function AlertDialogTitle({
  className,
  ...props
}: AlertDialogPrimitive.Title.Props) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn('text-base font-medium', className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: AlertDialogPrimitive.Description.Props) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn('flex justify-end gap-2', className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
};
