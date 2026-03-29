/* eslint-disable ts/no-unsafe-assignment */
import * as React from 'react';

import { renderWithProviders } from '../../../../test/render-helper';
import { DownloadCard } from './download-card';

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

describe('download-card', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<DownloadCard download={mockDownload} hideStatus />);
    expect(container).toBeTruthy();
  });
});
