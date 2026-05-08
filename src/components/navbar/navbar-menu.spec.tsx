import { fireEvent } from '@testing-library/react';

import { renderWithProviders } from '../../test/render-helper';
import { NavbarMenu } from './navbar-menu';

describe('navbar-menu', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<NavbarMenu menuIcon={<span>menu</span>} />);
    expect(container).toBeTruthy();
  });

  it('renders and opens menu with valid ref', () => {
    // Create a mock ref with a DOM element
    const mockRef = { current: document.createElement('div') };

    // Spy on console.warn
    const warnSpy = vi.spyOn(console, 'warn');

    const { container } = renderWithProviders(<NavbarMenu menuIcon={<span>menu</span>} navbarRef={mockRef} />);
    expect(container).toBeTruthy();

    // Click the toggle button
    const button = container.querySelector('#dropdown-menu-button');
    if (button) fireEvent.click(button);

    // Should not warn since ref is valid
    expect(warnSpy).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('warns when clicking without attached ref', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { container } = renderWithProviders(<NavbarMenu menuIcon={<span>menu</span>} />);

    // Click the toggle button
    const button = container.querySelector('#dropdown-menu-button');
    if (button) fireEvent.click(button);

    // Should warn since ref is missing/undefined
    expect(warnSpy).toHaveBeenCalledWith('NavbarMenu: navbarRef is not attached');

    warnSpy.mockRestore();
  });
});
