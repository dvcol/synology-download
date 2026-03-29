/* eslint-disable ts/no-unsafe-assignment */

import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsContextMenu } from './settings-context-menu';

describe('settings-context-menu', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <SettingsContextMenu
        menu={{ id: '1', title: 'Test', modal: false, enabled: true, destination: '' } as any}
        onRemove={async () => {}}
      />,
    );
    expect(container).toBeTruthy();
  });
});
