/* eslint-disable ts/no-unsafe-assignment */
import React from 'react';

import { renderWithProviders } from '../../../test/render-helper';
import { ContentItem } from './content-item';

const props = {
  accordion: { expanded: false, hover: false } as any,
  summary: { card: <span>card</span> },
  onToggle: () => {},
  onHover: () => {},
};

describe('content-item', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ContentItem {...props} />);
    expect(container).toBeTruthy();
  });
});
