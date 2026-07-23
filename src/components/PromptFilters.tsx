'use client';

import type { JSX } from 'react';
import { FilterState, MODEL_OPTIONS, CATEGORY_OPTIONS } from '@/types/prompt';
import { isModel, isCategory } from '@/utils/prompt';
import styles from './PromptFilters.module.css';

interface PromptFiltersProps {
  filterState: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  totalCount: number;
  filteredCount: number;
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
    filterState.showFavorites;

  const clearFilters = () => {
    onFilterChange({
      model: 'all',
      category: 'all',
      search: '',
      showFavorites: false,
    });
  };

  return (
    <div className={styles.filters}>
      <div className={styles.row}>
        <select
          value={filterState.model}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            if (value === 'all' || isModel(value))
              onFilterChange({ model: value });
          }}
          aria-label="Filter by model"
        >
          <option value="all">All models</option>
          {MODEL_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <select
          value={filterState.category}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            const value = e.target.value;
            if (value === 'all' || isCategory(value))
              onFilterChange({ category: value });
          }}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.favoriteToggle}
          aria-pressed={filterState.showFavorites}
          onClick={() =>
            onFilterChange({ showFavorites: !filterState.showFavorites })
          }
        >
          {filterState.showFavorites ? '★ Favorites' : '☆ Favorites'}
        </button>
      </div>
      <input
        type="text"
        className={styles.search}
        value={filterState.search}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onFilterChange({ search: e.target.value })
        }
        placeholder="Search prompts"
        aria-label="Search prompts"
      />
      <div className={styles.footer}>
        {hasActiveFilters && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearFilters}
          >
            Clear filters
          </button>
        )}
        <p className={styles.count}>
          Showing {filteredCount} of {totalCount} prompts.
        </p>
      </div>
    </div>
  );
}
