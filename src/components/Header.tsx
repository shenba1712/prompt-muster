import styles from "@/components/Header.module.css";
import {Category, Model} from "@/types/prompt";

interface HeaderProps {
    promptCount: number;
    onAddPrompt: (title: string,
                  content: string,
                  model: Model,
                  category: Category,
                  tags: string[]) => void;
}

export default function Header({ promptCount, onAddPrompt }: HeaderProps) {
    return (
        <header className={styles.header}>
            <h1>PromptLab</h1>
            <div className={styles.subheader}>
                <span>{promptCount} {promptCount === 1 ? 'prompt' : 'prompts'}</span>

                {/*For now, just hard coded values. Ideally, the PromptForm is connected to this button*/}
                <div className={styles.actions}>
                    <button onClick={() => onAddPrompt('new title' + (promptCount + 1), 'new prompt' + (promptCount + 1), 'claude-haiku', 'code-generation', ['test', 'prompt'])}>Add Prompt</button>
                </div>
            </div>
        </header>
    );
}
