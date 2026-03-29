import { renderWithProviders } from '../../../../test/render-helper';
import { JsonExplorer } from './json-explorer';

describe('json-explorer', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<JsonExplorer data={{ key: 'value' }} />);
    expect(container).toBeTruthy();
  });
});
