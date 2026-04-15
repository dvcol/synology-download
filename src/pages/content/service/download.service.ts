import { LoggerService } from '../../../services/logger/logger.service';
import { parseSrc } from '../../../utils/string.utils';

const utf8FilenameRegex = /filename\*=UTF-8''([^;\s]+)/i;
const filenameRegex = /filename="?([^";\s]+)"?/i;

function filenameFromContentDisposition(headers: Headers): string | undefined {
  const disposition = headers.get('Content-Disposition');
  if (!disposition) return undefined;

  // Try filename*=UTF-8''encoded first (RFC 5987)
  const utf8Match = disposition.match(utf8FilenameRegex);
  if (utf8Match) return decodeURIComponent(utf8Match[1]);

  // Fall back to filename="value" or filename=value
  const match = disposition.match(filenameRegex);
  return match ? match[1] : undefined;
}

export class ContentDownloadService {
  private static queue: (() => Promise<void>)[] = [];
  private static active = 0;
  private static concurrency = 5;
  private static delay = 1000;

  /**
   * Defines the configuration for the download service.
   */
  public static defineConfig(config: { concurrency?: number; delay?: number }): void {
    if (config.concurrency !== undefined) {
      this.concurrency = config.concurrency;
    }
    if (config.delay !== undefined) {
      this.delay = config.delay;
    }
  }

  /**
   * Internal reset method for testing purposes.
   */
  public static _reset(): void {
    this.queue = [];
    this.active = 0;
    this.concurrency = 5;
    this.delay = 1000;
  }

  /**
   * Queues a file download to respect the configured concurrency limit.
   */
  public static async download(url: string, hint?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await this.#download(url, hint));
        } catch (e) {
          reject(e);
        }
      });
      void this.next();
    });
  }

  private static async next(): Promise<void> {
    if (this.active >= this.concurrency || this.queue.length === 0) return;
    this.active++;
    const task = this.queue.shift()!;
    try {
      await task();
    } catch (e) {
      LoggerService.error('Download failed', e);
    } finally {
      this.active--;
      if (this.delay > 0) {
        setTimeout(() => void this.next(), this.delay);
      } else {
        void this.next();
      }
    }
  }

  static async #download(url: string, hint?: string): Promise<void> {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const filename = filenameFromContentDisposition(response.headers)
      ?? hint
      ?? parseSrc(url)
      ?? 'download';

    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Free memory after a minute
    setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  }
}
