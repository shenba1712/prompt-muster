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
  promptTitle: string;
  onConfirm: () => void;
  className?: string;
}

export default function DeleteConfirmDialog({
  promptTitle,
  onConfirm,
  className,
}: DeleteConfirmDialogProps): JSX.Element {
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

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
      <AlertDialogContent initialFocus={deleteButtonRef}>
        <AlertDialogTitle>Delete &quot;{promptTitle}&quot;?</AlertDialogTitle>
        <AlertDialogDescription>
          This can&apos;t be undone.
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogClose
            render={
              <Button type="button" variant="outline">
                Cancel
              </Button>
            }
          />
          <AlertDialogClose
            render={
              <Button
                ref={deleteButtonRef}
                type="button"
                variant="destructive"
                onClick={onConfirm}
              >
                Delete
              </Button>
            }
          />
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
