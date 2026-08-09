import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SettingsPage from './page';

describe('SettingsPage', () => {
  it('renders a Settings heading', () => {
    render(<SettingsPage />);

    expect(
      screen.getByRole('heading', { name: 'Settings' })
    ).not.toBeNull();
  });

  it('renders a "Coming soon" message', () => {
    render(<SettingsPage />);

    expect(screen.getByText('Coming soon.')).not.toBeNull();
  });
});
