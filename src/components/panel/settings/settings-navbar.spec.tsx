import type { SettingsPanelTab } from '../../../models/settings.model';

import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SettingHeader } from '../../../models/settings.model';
import { renderWithProviders } from '../../../test/render-helper';
import { SettingsNavbar } from './settings-navbar';

const tabs: SettingsPanelTab[] = [
  { label: SettingHeader.connection, links: ['credentials', 'polling'] },
  { label: SettingHeader.downloads, links: [] },
];

describe('settings-navbar', () => {
  it('renders without crashing with empty tabs', () => {
    const { container } = renderWithProviders(<SettingsNavbar tabs={[]} />);
    expect(container).toBeTruthy();
  });

  it('renders a tab for each entry', () => {
    renderWithProviders(<SettingsNavbar tabs={tabs} />);
    const renderedTabs = screen.getAllByRole('tab');
    // 2 main tabs + 2 sub-links for "connection"
    expect(renderedTabs).toHaveLength(4);
  });

  it('renders tabs as links with hash fragments', () => {
    renderWithProviders(<SettingsNavbar tabs={tabs} />);
    const renderedTabs = screen.getAllByRole('tab');
    // main tab links to absolute "/settings/label#label"
    expect(renderedTabs[0].getAttribute('href')).toBe('/settings/connection#connection');
    // sub-link links to "/settings/label#link"
    expect(renderedTabs[1].getAttribute('href')).toBe('/settings/connection#credentials');
    expect(renderedTabs[2].getAttribute('href')).toBe('/settings/connection#polling');
    // second main tab
    expect(renderedTabs[3].getAttribute('href')).toBe('/settings/downloads#downloads');
  });

  it('uses a custom anchor when provided', () => {
    const tabsWithAnchor: SettingsPanelTab[] = [
      { label: SettingHeader.interface, anchor: 'custom-anchor', links: [] },
    ];
    renderWithProviders(<SettingsNavbar tabs={tabsWithAnchor} />);
    const tab = screen.getByRole('tab');
    expect(tab.getAttribute('href')).toBe('/settings/interface#custom-anchor');
  });
});
