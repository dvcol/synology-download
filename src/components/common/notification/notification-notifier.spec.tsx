import { SnackbarProvider } from 'notistack';

import { renderWithProviders } from '../../../test/render-helper';
import { Notifier } from './notification-notifier';

describe('notification-notifier', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SnackbarProvider>
        <Notifier />
      </SnackbarProvider>,
    );
    expect(container).toBeTruthy();
  });
});
