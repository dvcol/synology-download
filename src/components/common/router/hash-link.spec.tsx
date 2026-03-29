import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '../../../test/render-helper';
import { HashLink } from './hash-link';

describe('hash-link', () => {
  it('renders a link with the correct href', () => {
    renderWithProviders(<HashLink to="/settings#connection">Click me</HashLink>);
    const link = screen.getByRole('link', { name: 'Click me' });
    expect(link.getAttribute('href')).toBe('/settings#connection');
  });

  it('calls scrollIntoView on the target element when clicked', async () => {
    const scrollIntoView = vi.fn();
    const target = document.createElement('div');
    target.id = 'my-section';
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    renderWithProviders(<HashLink to="/path#my-section">Go</HashLink>);
    fireEvent.click(screen.getByRole('link', { name: 'Go' }));

    // scrollIntoView is called in requestAnimationFrame
    await vi.waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1));

    document.body.removeChild(target);
  });

  it('forwards the onClick handler', () => {
    const onClick = vi.fn();
    renderWithProviders(
      <HashLink to="/path#section" onClick={onClick}>Link</HashLink>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Link' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('does not scroll when there is no hash fragment', () => {
    const scrollIntoView = vi.fn();
    const target = document.createElement('div');
    target.id = 'nohash';
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    renderWithProviders(<HashLink to="/path">No hash</HashLink>);
    fireEvent.click(screen.getByRole('link', { name: 'No hash' }));

    expect(scrollIntoView).not.toHaveBeenCalled();
    document.body.removeChild(target);
  });

  it('does not scroll when onClick calls preventDefault', () => {
    const scrollIntoView = vi.fn();
    const target = document.createElement('div');
    target.id = 'prevented';
    target.scrollIntoView = scrollIntoView;
    document.body.appendChild(target);

    renderWithProviders(
      <HashLink to="/path#prevented" onClick={e => e.preventDefault()}>Link</HashLink>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Link' }));

    expect(scrollIntoView).not.toHaveBeenCalled();
    document.body.removeChild(target);
  });
});
