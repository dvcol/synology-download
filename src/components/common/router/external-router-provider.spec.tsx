import { renderWithProviders } from '../../../test/render-helper';
import { ExternalRouterProvider } from './external-router-provider';

describe('external-router-provider', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<ExternalRouterProvider />);
    expect(container).toBeTruthy();
  });
});
