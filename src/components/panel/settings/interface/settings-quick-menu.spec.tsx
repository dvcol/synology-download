/* eslint-disable ts/no-unsafe-assignment */
import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsQuickMenu } from './settings-quick-menu';

describe('settings-quick-menu', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SettingsQuickMenu
        menu={{ id: '1', title: 'Test', enabled: true, modal: false, destination: '' } as any}
        onRemove={async () => {}}
      />,
    );
    expect(container).toBeTruthy();
  });
});
