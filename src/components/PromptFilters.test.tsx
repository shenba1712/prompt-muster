import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PromptFilters from './PromptFilters';
import { FilterState } from '@/types/prompt';

const defaultFilterState: FilterState = {
  model: 'all',
  category: 'all',
  search: '',
  showFavorites: false,
};

// PromptFilters is a controlled component: it renders filterState.search
// as-is and relies on the parent to feed updates back in. A static prop
// would make the search input reset to '' after every keystroke, so
// userEvent.type would only ever report the single last character typed.
// This wrapper mimics the real parent (PromptProvider) by applying each
// onFilterChange update to local state, while still exposing the spy so
// assertions can inspect every call.
function ControlledPromptFilters({
  initialFilterState,
  onFilterChange,
  totalCount,
  filteredCount,
}: {
  initialFilterState: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  totalCount: number;
  filteredCount: number;
}) {
  const [filterState, setFilterState] = useState(initialFilterState);
  return (
    <PromptFilters
      filterState={filterState}
      onFilterChange={(updates) => {
        onFilterChange(updates);
        setFilterState((prev) => ({ ...prev, ...updates }));
      }}
      totalCount={totalCount}
      filteredCount={filteredCount}
    />
  );
}

describe('PromptFilters', () => {
  it('renders the "Showing X of Y prompts." count', () => {
    render(
      <PromptFilters
        filterState={defaultFilterState}
        onFilterChange={vi.fn()}
        totalCount={10}
        filteredCount={3}
      />
    );

    expect(screen.getByText('Showing 3 of 10 prompts.')).not.toBeNull();
  });

  describe('favorites toggle', () => {
    it('calls onFilterChange with showFavorites: true when starting false', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(
        <PromptFilters
          filterState={defaultFilterState}
          onFilterChange={onFilterChange}
          totalCount={10}
          filteredCount={10}
        />
      );

      await user.click(screen.getByRole('button', { name: /Favorites/ }));

      expect(onFilterChange).toHaveBeenCalledTimes(1);
      expect(onFilterChange).toHaveBeenCalledWith({ showFavorites: true });
    });

    it('calls onFilterChange with showFavorites: false when starting true', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(
        <PromptFilters
          filterState={{ ...defaultFilterState, showFavorites: true }}
          onFilterChange={onFilterChange}
          totalCount={10}
          filteredCount={2}
        />
      );

      await user.click(screen.getByRole('button', { name: /Favorites/ }));

      expect(onFilterChange).toHaveBeenCalledTimes(1);
      expect(onFilterChange).toHaveBeenCalledWith({ showFavorites: false });
    });
  });

  describe('search input', () => {
    it('calls onFilterChange with the search value on each keystroke, ending with the full string', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(
        <ControlledPromptFilters
          initialFilterState={defaultFilterState}
          onFilterChange={onFilterChange}
          totalCount={10}
          filteredCount={10}
        />
      );

      await user.type(screen.getByLabelText('Search prompts'), 'foo');

      expect(onFilterChange).toHaveBeenCalledTimes(3);
      const lastCall =
        onFilterChange.mock.calls[onFilterChange.mock.calls.length - 1][0];
      expect(lastCall).toEqual({ search: 'foo' });
    });
  });

  describe('clear filters', () => {
    it('does not render "Clear filters" when no filters are active', () => {
      render(
        <PromptFilters
          filterState={defaultFilterState}
          onFilterChange={vi.fn()}
          totalCount={10}
          filteredCount={10}
        />
      );

      expect(
        screen.queryByRole('button', { name: 'Clear filters' })
      ).toBeNull();
    });

    it('renders "Clear filters" when search is active', () => {
      render(
        <PromptFilters
          filterState={{ ...defaultFilterState, search: 'foo' }}
          onFilterChange={vi.fn()}
          totalCount={10}
          filteredCount={1}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Clear filters' })
      ).not.toBeNull();
    });

    it('renders "Clear filters" when showFavorites is active', () => {
      render(
        <PromptFilters
          filterState={{ ...defaultFilterState, showFavorites: true }}
          onFilterChange={vi.fn()}
          totalCount={10}
          filteredCount={1}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Clear filters' })
      ).not.toBeNull();
    });

    it('renders "Clear filters" when model is not "all"', () => {
      render(
        <PromptFilters
          filterState={{ ...defaultFilterState, model: 'gpt-4o' }}
          onFilterChange={vi.fn()}
          totalCount={10}
          filteredCount={1}
        />
      );

      expect(
        screen.getByRole('button', { name: 'Clear filters' })
      ).not.toBeNull();
    });

    it('resets all filters when "Clear filters" is clicked', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(
        <PromptFilters
          filterState={{
            model: 'gpt-4o',
            category: 'testing',
            search: 'foo',
            showFavorites: true,
          }}
          onFilterChange={onFilterChange}
          totalCount={10}
          filteredCount={1}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Clear filters' }));

      expect(onFilterChange).toHaveBeenCalledTimes(1);
      expect(onFilterChange).toHaveBeenCalledWith({
        model: 'all',
        category: 'all',
        search: '',
        showFavorites: false,
      });
    });
  });

  describe('model and category selects', () => {
    it('calls onFilterChange with the selected model', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(
        <PromptFilters
          filterState={defaultFilterState}
          onFilterChange={onFilterChange}
          totalCount={10}
          filteredCount={10}
        />
      );

      await user.click(
        screen.getByRole('combobox', { name: 'Filter by model' })
      );
      const option = await screen.findByRole('option', { name: 'gpt-4o' });
      await user.click(option);

      expect(onFilterChange).toHaveBeenCalledWith({ model: 'gpt-4o' });
    });

    it('calls onFilterChange with the selected category', async () => {
      const user = userEvent.setup();
      const onFilterChange = vi.fn();
      render(
        <PromptFilters
          filterState={defaultFilterState}
          onFilterChange={onFilterChange}
          totalCount={10}
          filteredCount={10}
        />
      );

      await user.click(
        screen.getByRole('combobox', { name: 'Filter by category' })
      );
      const option = await screen.findByRole('option', { name: 'testing' });
      await user.click(option);

      expect(onFilterChange).toHaveBeenCalledWith({ category: 'testing' });
    });
  });
});
