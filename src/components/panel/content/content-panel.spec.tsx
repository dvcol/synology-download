import React from 'react';

import { renderWithProviders } from '../../../test/render-helper';
import { ContentPanel } from './content-panel';

describe('content-panel', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ContentPanel />);
    expect(container).toBeTruthy();
  });
});
