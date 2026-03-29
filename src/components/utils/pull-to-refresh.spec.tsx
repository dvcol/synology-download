import { useRef } from 'react';

import { renderWithProviders } from '../../test/render-helper';
import { RefreshLoader } from './pull-to-refresh';

function TestRefreshLoader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  return <RefreshLoader loaderRef={loaderRef} loaderHeight={50} refreshed={false} start={0} offset={0} progress={0} />;
}

describe('pull-to-refresh', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TestRefreshLoader />);
    expect(container).toBeTruthy();
  });
});
