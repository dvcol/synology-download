import * as React from 'react';
import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '../../test/render-helper';
import { LoadingBar } from './loading-bar';

describe('loading-bar', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<LoadingBar />);
    expect(container).toBeTruthy();
  });

  it('renders a LinearProgress element', () => {
    const { container } = renderWithProviders(<LoadingBar />);
    expect(container.querySelector('[role="progressbar"]')).toBeTruthy();
  });

  it('forwards additional props', () => {
    const { container } = renderWithProviders(<LoadingBar color="secondary" />);
    expect(container.querySelector('[role="progressbar"]')).toBeTruthy();
  });
});
