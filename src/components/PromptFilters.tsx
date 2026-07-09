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
    return (
        <div className={styles.filters}>
            <div className={styles.row}>
                <select
                    value={filterState.model}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const value = e.target.value;
                        if (value === 'all' || isModel(value)) onFilterChange({ model: value });
                    }}
                >
                    <option value="all">All models</option>
                    {MODEL_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <select
                    value={filterState.category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        const value = e.target.value;
                        if (value === 'all' || isCategory(value)) onFilterChange({ category: value });
                    }}
                >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <input
                    type="text"
                    value={filterState.search}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        onFilterChange({ search: e.target.value })
                    }
                    placeholder="Search prompts"
                />
                <button
                    type="button"
                    className={styles.favoriteToggle}
                    aria-pressed={filterState.showFavorites}
                    onClick={() => onFilterChange({ showFavorites: !filterState.showFavorites })}
                >
                    {filterState.showFavorites ? '★ Favorites' : '☆ Favorites'}
                </button>
            </div>
            <p className={styles.count}>Showing {filteredCount} of {totalCount} prompts.</p>
        </div>
    );
}
