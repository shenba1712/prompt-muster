import styles from "@/components/Header.module.css";
import { CreatePromptInput } from "@/utils/prompt";

interface HeaderProps {
    promptCount: number;
    onAddPrompt: (input: CreatePromptInput) => void;
}

export default function Header({ promptCount, onAddPrompt }: HeaderProps) {
    return (
        <header className={styles.header}>
            <h1>PromptLab</h1>
            <div className={styles.subheader}>
                <span>{promptCount} {promptCount === 1 ? 'prompt' : 'prompts'}</span>

                {/*For now, just hard coded values. Ideally, the PromptForm is connected to this button*/}
                <div className={styles.actions}>
                    <button onClick={() => onAddPrompt({
                        title: 'new title' + (promptCount + 1),
                        content: 'new prompt' + (promptCount + 1),
                        model: 'claude-haiku',
                        category: 'code-generation',
                        tags: ['test', 'prompt'],
                    })}>Add Prompt</button>
                </div>
            </div>
        </header>
    );
}
