import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ContentDownloadService } from './download.service';

describe('tests ContentDownloadService', () => {
  beforeEach(() => {
    ContentDownloadService._reset();
    ContentDownloadService.defineConfig({ concurrency: 2 });

    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();

    // Mock anchor element
    const mockAnchor = { click: vi.fn(), download: '', href: '', style: {} };
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(vi.fn() as unknown as (node: Node) => Node);
    vi.spyOn(document.body, 'removeChild').mockImplementation(vi.fn() as unknown as (child: Node) => Node);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => Promise.resolve(new Blob(['mock data'], { type: 'text/plain' })),
      headers: new Headers(),
    }));

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should queue downloads and respect concurrency limit', async () => {
    let resolve1: (arg: unknown) => void;
    let resolve2: (arg: unknown) => void;
    let resolve3: (arg: unknown) => void;

    const p1 = new Promise((r) => {
      resolve1 = r;
    });
    const p2 = new Promise((r) => {
      resolve2 = r;
    });
    const p3 = new Promise((r) => {
      resolve3 = r;
    });

    vi.mocked(fetch)
      .mockReturnValueOnce(p1 as unknown as Promise<Response>)
      .mockReturnValueOnce(p2 as unknown as Promise<Response>)
      .mockReturnValueOnce(p3 as unknown as Promise<Response>);

    // Trigger 3 downloads (Concurrency is set to 2)
    void ContentDownloadService.download('http://domain.com/file1');
    void ContentDownloadService.download('http://domain.com/file2');
    void ContentDownloadService.download('http://domain.com/file3');

    // Due to event-loop sequencing inside the promises, wait for microtasks
    await Promise.resolve();

    expect(fetch).toHaveBeenCalledTimes(2); // Only 2 started because limit is 2

    // Resolve the first fetch request
    resolve1!({ blob: async () => Promise.resolve(new Blob()), headers: new Headers(), ok: true });

    // Allow queued `.next()` check to trigger
    await Promise.resolve();
    // Simulate any `.then` propagation in tests
    await vi.runAllTimersAsync();

    expect(fetch).toHaveBeenCalledTimes(3); // 3rd one started after 1 finished

    resolve2!({ blob: async () => Promise.resolve(new Blob()), headers: new Headers(), ok: true });
    resolve3!({ blob: async () => Promise.resolve(new Blob()), headers: new Headers(), ok: true });
  });

  it('should correctly extract filename from headers', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      blob: async () => Promise.resolve(new Blob()),
      headers: new Headers({ 'Content-Disposition': 'filename="actual.pdf"' }),
      ok: true,
    } as unknown as Response);

    await ContentDownloadService.download('http://domain.com/file', 'hint.pdf');

    expect(document.createElement).toHaveBeenCalledWith('a');

    // Check what the parsed download property was on the mock anchor
    const dummyAnchor = vi.mocked(document.createElement).mock.results[0].value as HTMLAnchorElement;
    expect(dummyAnchor.download).toBe('actual.pdf');
  });

  it('should fallback to hint or parseSrc if no header is present', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      blob: async () => Promise.resolve(new Blob()),
      headers: new Headers(),
      ok: true,
    } as unknown as Response);

    await ContentDownloadService.download('http://domain.com/foo/bar.png', 'hint.jpg');

    const dummyAnchor = vi.mocked(document.createElement).mock.results[0].value as HTMLAnchorElement;
    expect(dummyAnchor.download).toBe('hint.jpg'); // hint takes priority over url parsing
  });
});
