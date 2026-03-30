import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../../test/render-helper';
import { FormInputPassword } from './form-input-password';

describe('form-input-password', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<FormInputPassword onToggle={() => {}} />);
    expect(container).toBeTruthy();
  });

  it('renders a toggle button with aria-label', () => {
    renderWithProviders(<FormInputPassword onToggle={() => {}} />);
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('calls onToggle with false initially (useEffect fires on mount)', () => {
    const onToggle = vi.fn();
    renderWithProviders(<FormInputPassword onToggle={onToggle} />);
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('calls onToggle with true after clicking toggle', () => {
    const onToggle = vi.fn();
    renderWithProviders(<FormInputPassword onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('calls onToggle with false after clicking toggle twice', () => {
    const onToggle = vi.fn();
    renderWithProviders(<FormInputPassword onToggle={onToggle} />);
    fireEvent.click(screen.getByRole('button'));
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });
});
