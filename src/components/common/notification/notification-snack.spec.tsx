/* eslint-disable ts/no-unsafe-assignment */
import { SnackbarProvider } from 'notistack';

import { renderWithProviders } from '../../../test/render-helper';
import { SnackNotificationCard } from './notification-snack';

const mockNotification = {
  title: 'Test',
  message: 'Test message',
  severity: 'info',
} as any;

describe('notification-snack', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SnackbarProvider>
        <SnackNotificationCard id="test-1" notification={mockNotification} />
      </SnackbarProvider>,
    );
    expect(container).toBeTruthy();
  });
});
