'use client';

import type { JSX } from 'react';
import { StarIcon } from '@phosphor-icons/react';
import { FilterState, MODEL_OPTIONS, CATEGORY_OPTIONS } from '@/types/prompt';
import { isModel, isCategory } from '@/utils/prompt';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import styles from './PromptFilters.module.css';

interface PromptFiltersProps {
  readonly filterState: FilterState;
  readonly onFilterChange: (updates: Partial<FilterState>) => void;
  readonly totalCount: number;
  readonly filteredCount: number;
}

export default function PromptFilters({
  filterState,
  onFilterChange,
  totalCount,
  filteredCount,
}: PromptFiltersProps): JSX.Element {
  const hasActiveFilters =
    filterState.model !== 'all' ||
    filterState.category !== 'all' ||
    filterState.search.trim() !== '' ||
    filterState.isFavoritesOnly;

  const clearFilters = () => {
    onFilterChange({
      model: 'all',
      category: 'all',
      search: '',
      isFavoritesOnly: false,
    });
  };

  return (
    <div className={styles.filters}>
      <div className={styles.row}>
        <Select
          value={filterState.model}
          onValueChange={(value: string | null) => {
            if (value !== null && (value === 'all' || isModel(value)))
              onFilterChange({ model: value });
          }}
        >
          <SelectTrigger
            aria-label="Filter by model"
            className="flex-1 min-w-[140px]"
          >
            <SelectValue>
              {(value: string) => (value === 'all' ? 'All models' : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All models</SelectItem>
            {MODEL_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filterState.category}
          onValueChange={(value: string | null) => {
            if (value !== null && (value === 'all' || isCategory(value)))
              onFilterChange({ category: value });
          }}
        >
          <SelectTrigger
            aria-label="Filter by category"
            className="flex-1 min-w-[140px]"
          >
            <SelectValue>
              {(value: string) => (value === 'all' ? 'All categories' : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORY_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant={filterState.isFavoritesOnly ? 'default' : 'outline'}
          aria-pressed={filterState.isFavoritesOnly}
          onClick={() =>
            onFilterChange({ isFavoritesOnly: !filterState.isFavoritesOnly })
          }
          className="flex-1 min-w-[140px]"
        >
          <StarIcon weight={filterState.isFavoritesOnly ? 'fill' : 'regular'} />
          Favorites
        </Button>
      </div>
      <Input
        type="text"
        value={filterState.search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onFilterChange({ search: e.target.value })
        }
        placeholder="Search prompts"
        aria-label="Search prompts"
      />
      <div className={styles.footer}>
        {hasActiveFilters && (
          <Button type="button" variant="link" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
        <p className={styles.count}>
          Showing {filteredCount} of {totalCount} prompts.
        </p>
      </div>
    </div>
  );
}
