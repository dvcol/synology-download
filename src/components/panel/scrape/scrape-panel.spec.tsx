import * as React from 'react';

import { renderWithProviders } from '../../../test/render-helper';
import { ScrapePanel } from './scrape-panel';

describe('scrape-panel', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ScrapePanel />);
    expect(container).toBeTruthy();
  });
});
