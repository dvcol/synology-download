import { renderWithProviders } from '../../../test/render-helper';
import { ContainerContextProvider } from './container-content-provider';

describe('container-content-provider', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <ContainerContextProvider>
        <div>test</div>
      </ContainerContextProvider>,
    );
    expect(container).toBeTruthy();
  });
});
