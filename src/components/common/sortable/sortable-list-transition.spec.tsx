import { renderWithProviders } from '../../../test/render-helper';
import { SortableListItemTransition } from './sortable-list-transition';

describe('sortable-list-transition', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SortableListItemTransition item={{ id: 'test-1', index: 0 }} />,
    );
    expect(container).toBeTruthy();
  });
});
