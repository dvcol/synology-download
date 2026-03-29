import type { ComponentProps } from 'react';

import * as React from 'react';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';

export type HashLinkProps = ComponentProps<typeof Link>;

/**
 * A Link that scrolls to the element matching the URL hash after navigation.
 * Drop-in replacement for react-router-hash-link's HashLink, compatible with react-router v7.
 */
export function HashLink({ ref, onClick, to, ...rest }: HashLinkProps & { ref?: React.RefObject<HTMLAnchorElement | null> }) {
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);

      if (e.defaultPrevented) return;

      const hash = typeof to === 'string' ? to.split('#')[1] : (to as { hash?: string }).hash?.replace('#', '');

      if (hash) {
        // Defer to let react-router finish the navigation first
        requestAnimationFrame(() => {
          document.getElementById(hash)?.scrollIntoView();
        });
      }
    },
    [onClick, to],
  );

  return <Link ref={ref} to={to} onClick={handleClick} {...rest} />;
}
