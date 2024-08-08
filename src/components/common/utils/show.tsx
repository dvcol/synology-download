import React, { Suspense } from 'react';

import type { FC, PropsWithChildren, ReactNode } from 'react';

export const Show: FC<
  PropsWithChildren<{
    show: boolean;
    lazy?: boolean;
    content?: NonNullable<ReactNode>;
    fallback?: NonNullable<ReactNode>;
  }>
> = ({ show, lazy, content = null, fallback = null, children }) => {
  const _content = content ?? children;
  if (!show || !_content) return <>{fallback ?? null}</>;
  if (lazy) return <Suspense fallback={fallback}>{_content}</Suspense>;
  return <>{_content}</>;
};

export default Show;
