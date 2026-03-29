import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsDownloadsExtensions } from './settings-downloads-extensions';

describe('settings-downloads-extensions', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SettingsDownloadsExtensions addExtension={() => {}} />,
    );
    expect(container).toBeTruthy();
  });
});
