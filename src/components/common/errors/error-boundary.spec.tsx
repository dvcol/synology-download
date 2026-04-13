import type { FC } from 'react';

import { screen } from '@testing-library/react';
import * as React from 'react';
import { vi } from 'vitest';

import { LoggerService } from '../../../services/logger/logger.service';
import { renderWithProviders } from '../../../test/render-helper';
import { ErrorBoundary } from './error-boundary';

// Mock the logger to avoid console spam during expected test errors
vi.spyOn(LoggerService, 'error').mockImplementation(() => {});

const ChildComponent = () => <div>Everything is fine</div>;
const testError = new Error('Test error rendering');
const ThrowingComponent: FC = () => {
  throw testError;
};

describe('test ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children without error', () => {
    const { container } = renderWithProviders(
      <ErrorBoundary>
        <ChildComponent />
      </ErrorBoundary>,
    );
    expect(container).toBeTruthy();
    expect(screen.getByText('Everything is fine')).toBeTruthy();
  });

  it('catches error and displays fallback UI', () => {
    // Suppress console.error solely for React's default error logging in the test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(
      <ErrorBoundary name="TestComp">
        <ThrowingComponent />
      </ErrorBoundary>,
    );

    // Verify fallback UI
    expect(screen.getByText('Error in TestComp')).toBeTruthy();
    expect(screen.getByText(/Test error rendering/)).toBeTruthy();

    // Verify logger was called
    expect(LoggerService.error).toHaveBeenCalled();
    expect(LoggerService.error).toHaveBeenCalledWith(
      'Error caught in TestComp',
      expect.objectContaining({
        error: testError,
      }),
    );

    consoleError.mockRestore();
  });
});
