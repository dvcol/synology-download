import React from 'react';

import { renderWithProviders } from '../../../test/render-helper';
import { ContentEmpty } from './content-empty';

describe('content-empty', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ContentEmpty />);
    expect(container).toBeTruthy();
  });
});
