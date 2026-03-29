import { useRef } from 'react';

import { renderWithProviders } from '../../../test/render-helper';
import { SearchInput } from './search-input';

function TestSearchInput() {
  const containerRef = useRef<HTMLDivElement>(null);
  return <SearchInput containerRef={containerRef} filter="" onChangeFilter={() => {}} />;
}

describe('search-input', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TestSearchInput />);
    expect(container).toBeTruthy();
  });
});
