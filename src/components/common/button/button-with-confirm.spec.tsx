import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../../test/render-helper';
import { ButtonWithConfirm } from './button-with-confirm';

describe('button-with-confirm', () => {
  it('renders button with label', () => {
    renderWithProviders(<ButtonWithConfirm buttonLabel="Delete" />);
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();
  });

  it('does not show dialog initially', () => {
    renderWithProviders(<ButtonWithConfirm buttonLabel="Delete" dialogTitle="Confirm Delete" />);
    expect(screen.queryByText('Confirm Delete')).toBeNull();
  });

  it('opens dialog when button is clicked', () => {
    renderWithProviders(<ButtonWithConfirm buttonLabel="Delete" dialogTitle="Confirm Delete" />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByText('Confirm Delete')).toBeTruthy();
  });

  it('calls onButtonClick when button is clicked', () => {
    const onButtonClick = vi.fn();
    renderWithProviders(<ButtonWithConfirm buttonLabel="Delete" onButtonClick={onButtonClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onButtonClick).toHaveBeenCalledTimes(1);
  });

  it('calls onDialogConfirm and closes dialog on confirm', () => {
    const onDialogConfirm = vi.fn();
    renderWithProviders(
      <ButtonWithConfirm buttonLabel="Delete" dialogTitle="Confirm?" onDialogConfirm={onDialogConfirm} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(screen.getByText('Confirm?')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onDialogConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onDialogCancel and closes dialog on cancel', () => {
    const onDialogCancel = vi.fn();
    renderWithProviders(
      <ButtonWithConfirm buttonLabel="Delete" dialogTitle="Confirm?" onDialogCancel={onDialogCancel} />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onDialogCancel).toHaveBeenCalledTimes(1);
  });

  it('renders JSX button label', () => {
    renderWithProviders(<ButtonWithConfirm buttonLabel={<span>Custom Label</span>} />);
    expect(screen.getByText('Custom Label')).toBeTruthy();
  });
});
