/* eslint-disable ts/no-unsafe-assignment */
import React from 'react';

import { renderWithProviders } from '../../../../test/render-helper';
import { DownloadItem } from './download-item';

const mockDownload = {
  id: 'test-1',
  filename: 'test.txt',
  url: 'http://example.com/test.txt',
  filesize: 1024,
  bytesReceived: 512,
  state: 'in_progress',
  exists: true,
  paused: false,
  canResume: true,
  startTime: new Date().toISOString(),
} as any;

describe('download-item', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DownloadItem download={mockDownload} accordion={{ expanded: false, hover: false } as any} hideStatus />,
    );
    expect(container).toBeTruthy();
  });
});
