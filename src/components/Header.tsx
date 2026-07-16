import type { JSX } from 'react';
import styles from "@/components/Header.module.css";

interface HeaderProps {
    onOpenForm: () => void;
}

export default function Header({ onOpenForm }: HeaderProps): JSX.Element {
    return (
        <header className={styles.header}>
            <h1>PromptMuster</h1>
            <button className={styles.addButton} onClick={onOpenForm}>Add Prompt</button>
        </header>
    );
}
