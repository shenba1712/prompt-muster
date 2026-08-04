import type { JSX } from 'react';
import Header from '@/components/Header';
import styles from './page.module.css';

export default function PromptsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
