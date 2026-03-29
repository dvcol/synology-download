import { renderWithProviders } from '../../../test/render-helper';
import { SortableList } from './sortable-list';

describe('sortable-list', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SortableList values={['a', 'b']} render={v => <div>{v}</div>} />,
    );
    expect(container).toBeTruthy();
  });
});
