import { mapToDownload } from '../../../../models/download.model';
import { renderWithProviders } from '../../../../test/render-helper';
import { DownloadCard } from './download-card';

const download = {
  ...mapToDownload({
    id: 1,
    filename: '/downloads/test.txt',
    url: 'https://example.com/test.txt',
    finalUrl: 'https://example.com/test.txt',
    referrer: '',
    mime: 'text/plain',
    incognito: false,
    danger: 'safe',
    bytesReceived: 512000,
    totalBytes: 1000000,
    fileSize: 1000000,
    state: 'in_progress',
    exists: true,
    paused: false,
    canResume: true,
    startTime: '2026-01-01T00:00:00Z',
  }),
  speed: 1000,
  eta: '8m 08s',
};

describe('download-card progress text', () => {
  it.each([
    { received: 512000, size: 1000000, expected: '512 kB of 1 MB downloaded' },
    { received: 0, size: 0, expected: '0 B of 0 B downloaded' },
    { received: 0, size: 1000000, expected: '0 B of 1 MB downloaded' },
  ])('renders spaced byte counts: $expected', ({ received, size, expected }) => {
    expect.assertions(4);
    const { container, getByText } = renderWithProviders(<DownloadCard download={{ ...download, received, size }} />);
    expect(getByText(expected)).toBeTruthy();
    expect(container.textContent).toContain('common__model__download_status__downloading_in_progress');
    expect(container.textContent).toContain('8m 08s');
    expect(container.textContent).toContain('1 kB/s');
  });

  it('keeps byte counts when status is hidden and speed is unavailable', () => {
    expect.assertions(3);
    const { container, getByText } = renderWithProviders(<DownloadCard download={{ ...download, speed: 0 }} hideStatus />);
    expect(getByText('512 kB of 1 MB downloaded')).toBeTruthy();
    expect(container.textContent).not.toContain('common__model__download_status__downloading_in_progress');
    expect(container.textContent).not.toContain('/s');
  });
});
