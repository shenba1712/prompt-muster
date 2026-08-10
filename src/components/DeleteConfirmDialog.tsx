'use client';

import { useRef, type JSX } from 'react';
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

interface DeleteConfirmDialogProps {
  readonly promptTitle: string;
  readonly onConfirm: () => void;
  readonly className?: string;
}

export default function DeleteConfirmDialog({
  promptTitle,
  onConfirm,
  className,
}: DeleteConfirmDialogProps): JSX.Element {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className={className}
          >
            Delete
          </Button>
        }
      />
      <AlertDialogContent initialFocus={cancelButtonRef}>
        <AlertDialogTitle>Delete &quot;{promptTitle}&quot;?</AlertDialogTitle>
        <AlertDialogDescription>
          This can&apos;t be undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogClose
            render={
              <Button ref={cancelButtonRef} type="button" variant="outline">
                Cancel
              </Button>
            }
          />
          <AlertDialogClose
            render={
              <Button type="button" variant="destructive" onClick={onConfirm}>
                Delete
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
