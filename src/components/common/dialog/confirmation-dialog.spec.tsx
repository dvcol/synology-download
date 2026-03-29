import { fireEvent, screen } from '@testing-library/react';
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../../test/render-helper';
import { ConfirmationDialog } from './confirmation-dialog';

describe('confirmation-dialog', () => {
  it('renders without crashing when closed', () => {
    const { container } = renderWithProviders(<ConfirmationDialog open={false} />);
    expect(container).toBeTruthy();
  });

  it('does not show dialog content when closed', () => {
    renderWithProviders(<ConfirmationDialog open={false} title="My Title" description="My Desc" />);
    expect(screen.queryByText('My Title')).toBeNull();
  });

  it('shows title and description when open', () => {
    renderWithProviders(<ConfirmationDialog open={true} title="Delete Item" description="Are you sure?" />);
    expect(screen.getByText('Delete Item')).toBeTruthy();
    expect(screen.getByText('Are you sure?')).toBeTruthy();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    renderWithProviders(<ConfirmationDialog open={true} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', () => {
    const onConfirm = vi.fn();
    renderWithProviders(<ConfirmationDialog open={true} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not call onConfirm when cancel is clicked', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderWithProviders(<ConfirmationDialog open={true} onConfirm={onConfirm} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('renders JSX title and description', () => {
    renderWithProviders(
      <ConfirmationDialog open={true} title={<span>JSX Title</span>} description={<span>JSX Desc</span>} />,
    );
    expect(screen.getByText('JSX Title')).toBeTruthy();
    expect(screen.getByText('JSX Desc')).toBeTruthy();
  });
});
