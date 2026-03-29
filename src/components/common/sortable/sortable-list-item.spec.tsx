import { renderWithProviders } from '../../../test/render-helper';
import { SortableListItem } from './sortable-list-item';

describe('sortable-list-item', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SortableListItem id="test-1">
        <span>item</span>
      </SortableListItem>,
    );
    expect(container).toBeTruthy();
  });
});
