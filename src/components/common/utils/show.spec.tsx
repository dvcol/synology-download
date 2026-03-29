import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';

import { Show } from './show';

describe('show', () => {
  it('renders content when show is true', () => {
    render(<Show show={true} content={<div>visible</div>} />);
    expect(screen.getByText('visible')).toBeTruthy();
  });

  it('does not render content when show is false', () => {
    render(<Show show={false} content={<div>hidden</div>} />);
    expect(screen.queryByText('hidden')).toBeNull();
  });

  it('renders fallback when show is false', () => {
    render(<Show show={false} fallback={<div>fallback</div>} content={<div>main</div>} />);
    expect(screen.getByText('fallback')).toBeTruthy();
    expect(screen.queryByText('main')).toBeNull();
  });

  it('renders children when content is not provided', () => {
    render(<Show show={true}><span>child</span></Show>);
    expect(screen.getByText('child')).toBeTruthy();
  });

  it('prefers content prop over children', () => {
    render(<Show show={true} content={<div>content</div>}><span>child</span></Show>);
    expect(screen.getByText('content')).toBeTruthy();
    expect(screen.queryByText('child')).toBeNull();
  });

  it('renders fallback when content is null and show is true', () => {
    render(<Show show={true} fallback={<div>fallback</div>} />);
    expect(screen.getByText('fallback')).toBeTruthy();
  });

  it('wraps content in Suspense when lazy is true', () => {
    const { container } = render(<Show show={true} lazy content={<div>lazy-content</div>} />);
    expect(screen.getByText('lazy-content')).toBeTruthy();
    expect(container).toBeTruthy();
  });
});
