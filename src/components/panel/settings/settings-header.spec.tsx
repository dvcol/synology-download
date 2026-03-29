/* eslint-disable ts/no-unsafe-assignment */
import { renderWithProviders } from '../../../test/render-helper';
import { SettingsHeader } from './settings-header';

describe('settings-header', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SettingsHeader label={{ title: 'Test', icon: 'settings' } as any} />,
    );
    expect(container).toBeTruthy();
  });
});
