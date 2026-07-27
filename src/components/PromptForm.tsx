'use client';

import { useState, useRef, useEffect, type JSX } from 'react';
import {
  Model,
  Category,
  MODEL_OPTIONS,
  CATEGORY_OPTIONS,
  CreatePromptInput,
  Prompt,
} from '@/types/prompt';
import { isModel, isCategory } from '@/utils/prompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import styles from './PromptForm.module.css';

interface PromptFormProps {
  prompt?: Prompt;
  onSave: (input: CreatePromptInput) => void;
  onCancel: () => void;
}

export default function PromptForm({
  prompt,
  onSave,
  onCancel,
}: PromptFormProps): JSX.Element {
  const isEditing = prompt !== undefined;
  const [title, setTitle] = useState(prompt?.title ?? '');
  const [content, setContent] = useState(prompt?.content ?? '');
  const [model, setModel] = useState<Model>(prompt?.model ?? MODEL_OPTIONS[0]);
  const [category, setCategory] = useState<Category>(
    prompt?.category ?? CATEGORY_OPTIONS[0]
  );
  const [tags, setTags] = useState(prompt?.tags.join(', ') ?? '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  // On open, bring the form into view and focus the title so it's obvious the
  // form opened — the Edit button can be far below the form's position.
  // block: 'nearest' scrolls the minimum needed (and not at all if the form is
  // already visible), so it's not a jarring jump to the top. Instant (not
  // smooth) so it isn't defeated by the browser's scroll-anchoring shift.
  useEffect(() => {
    formRef.current?.scrollIntoView({ block: 'nearest' });
    titleInputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (title.trim() === '' || content.trim() === '') {
      setError('Title and content are required.');
      return;
    }
    setError(null);
    const seenTags = new Set<string>();
    const uniqueTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .filter((tag) => {
        const key = tag.toLowerCase();
        if (seenTags.has(key)) return false;
        seenTags.add(key);
        return true;
      });
    onSave({
      title: title.trim(),
      content: content.trim(),
      model,
      category,
      tags: uniqueTags,
    });
    // In edit mode the parent closes (unmounts) the form on save.
    // In create mode, reset for the next entry and refocus the title.
    if (!isEditing) {
      setTitle('');
      setContent('');
      setModel(MODEL_OPTIONS[0]);
      setCategory(CATEGORY_OPTIONS[0]);
      setTags('');
      titleInputRef.current?.focus();
    }
  };

  return (
    <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
      <Input
        ref={titleInputRef}
        type="text"
        value={title}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setTitle(e.target.value)
        }
        placeholder="Prompt title"
        aria-label="Prompt title"
      />
      <Textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setContent(e.target.value)
        }
        placeholder="Prompt content"
        aria-label="Prompt content"
      />
      <div className={styles.row}>
        <Select
          value={model}
          onValueChange={(value: string | null) => {
            if (value !== null && isModel(value)) setModel(value);
          }}
        >
          <SelectTrigger aria-label="Model" className="flex-1 min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={category}
          onValueChange={(value: string | null) => {
            if (value !== null && isCategory(value)) setCategory(value);
          }}
        >
          <SelectTrigger aria-label="Category" className="flex-1 min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Input
        type="text"
        value={tags}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setTags(e.target.value)
        }
        placeholder="Tags (comma-separated)"
        aria-label="Tags (comma-separated)"
      />
      <div>
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
      </div>
      <div className={styles.actions}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Save changes' : 'Add Prompt'}
        </Button>
      </div>
    </form>
  );
}
