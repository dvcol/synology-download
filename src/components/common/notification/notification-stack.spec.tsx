import { renderWithProviders } from '../../../test/render-helper';
import { NotificationStack } from './notification-stack';

describe('notification-stack', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<NotificationStack />);
    expect(container).toBeTruthy();
  });
});
