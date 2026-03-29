/* eslint-disable ts/no-unsafe-assignment */
import { useState } from 'react';

import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsAccordion } from './settings-accordion';

function TestSettingsAccordion() {
  const state = useState<string | false>(false);
  return (
    <SettingsAccordion
      title={{ title: 'Test', icon: 'settings' } as any}
      list={[{ id: '1', name: 'item1' }]}
      summary={(item: { id: string; name: string }) => <span>{item.name}</span>}
      detail={(item: { id: string; name: string }) => <div>{item.name}</div>}
      state={state}
    />
  );
}

describe('settings-accordion', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<TestSettingsAccordion />);
    expect(container).toBeTruthy();
  });
});
