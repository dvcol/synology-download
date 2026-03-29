import React from 'react';

import { renderWithProviders } from '../../../test/render-helper';
import { ContentCard } from './content-card';

describe('content-card', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ContentCard
        title="Test"
        icon={<span>icon</span>}
        description={<span>desc</span>}
      />,
    );
    expect(container).toBeTruthy();
  });
});
