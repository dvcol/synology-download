/* eslint-disable ts/no-unsafe-assignment */
import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsTab } from './settings-tab';

describe('settings-tab', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SettingsTab
        tab={{ id: '1', title: 'Test', enabled: true, type: 'download' } as any}
        onRemove={async () => {}}
      />,
    );
    expect(container).toBeTruthy();
  });
});
