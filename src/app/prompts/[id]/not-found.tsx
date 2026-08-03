import type { JSX } from 'react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import styles from '../page.module.css';

export default function PromptNotFound(): JSX.Element {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Card>
          <CardHeader>
            <CardTitle>Prompt not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We couldn&apos;t find this prompt. It may not exist, or your
              prompts haven&apos;t loaded yet (everything is stored in memory
              for now, so a refresh clears them). Head back to the list to pick
              up where you left off.
            </p>
            <Link
              href="/prompts"
              className={buttonVariants({ variant: 'outline' })}
            >
              ← Back to prompts
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
