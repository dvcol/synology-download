/* eslint-disable ts/no-unsafe-assignment */
import * as React from 'react';

import { renderWithProviders } from '../../../../test/render-helper';
import { DownloadDetail } from './download-detail';

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

describe('download-detail', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(
      <DownloadDetail download={mockDownload} buttons={[]} onclick={() => {}} />,
    );
    expect(container).toBeTruthy();
  });
});
