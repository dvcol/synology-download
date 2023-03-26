import { tap } from 'rxjs';

import type {
  ScrapedAudio,
  ScrapedContent,
  ScrapedContents,
  ScrapedContentsPayload,
  ScrapedImages,
  ScrapedLinks,
  ScrapedPage,
  ScrapedVideos,
} from '@src/models';
import { ChromeMessageType, emptyContents } from '@src/models';
import { LoggerService } from '@src/services';
import { onMessage, parseSrc, sendMessage } from '@src/utils';

const addOrUpdate = <T extends ScrapedContent>(map: Map<string, T>, scrapped: T) => {
  const _previous: Partial<T> = map.get(scrapped.src) ?? {};
  map.set(scrapped.src, {
    ..._previous,
    ...scrapped,
    title: scrapped.title?.trim() || _previous.title?.trim(),
  });
};

const scrapeAudios = (_document?: Document | null, withElements?: boolean): ScrapedAudio[] => {
  if (!_document) return [];

  const links = new Map<string, ScrapedAudio>();

  _document.querySelectorAll<HTMLSourceElement>('audio > source[src]')?.forEach(source => {
    if (!source.src) return;
    addOrUpdate(links, {
      title: source?.title?.trim() || parseSrc(source.src),
      src: source.src,
      type: source.type || 'audio',
      element: withElements ? source : undefined,
    });
  });

  return [...links.values()];
};

const scrapeVideos = (_document?: Document | null, withElements?: boolean): ScrapedVideos[] => {
  if (!_document) return [];

  const links = new Map<string, ScrapedVideos>();

  _document.querySelectorAll<HTMLVideoElement>('video[src]')?.forEach(video => {
    if (!video.currentSrc) return;
    addOrUpdate(links, {
      title: video?.title?.trim() || parseSrc(video.currentSrc),
      src: video.currentSrc,
      duration: video.duration,
      element: withElements ? video : undefined,
      type: 'video',
    });
  });

  _document.querySelectorAll<HTMLSourceElement>('video > source[src]')?.forEach(source => {
    if (!source.src) return;
    addOrUpdate(links, {
      title: source?.title?.trim() || parseSrc(source.src),
      src: source.src,
      type: source.type || 'video',
      element: withElements ? source : undefined,
    });
  });

  return [...links.values()];
};

const backgroundImageRegex = /url\("(.*)"/;
const scrapeImages = (_document?: Document | null, withElements?: boolean): ScrapedImages[] => {
  if (!_document) return [];

  const links = new Map<string, ScrapedImages>();

  _document.querySelectorAll<HTMLImageElement>('img[src]')?.forEach(image => {
    if (!image.currentSrc) return;
    addOrUpdate(links, {
      title: image?.title?.trim() || image?.alt?.trim() || parseSrc(image.currentSrc),
      src: image.currentSrc,
      type: 'image',
      element: withElements ? image : undefined,
    });
  });

  _document.querySelectorAll<HTMLSourceElement>('picture > source[srcset]')?.forEach(source => {
    if (!source.srcset) return;
    addOrUpdate(links, {
      title: source?.title?.trim() || parseSrc(source.srcset),
      src: source.srcset,
      type: source.type || 'image',
      element: withElements ? source : undefined,
    });
  });

  _document.querySelectorAll<HTMLElement>('[style*=background-image]')?.forEach(element => {
    const bgImageStyle: string = element?.style?.backgroundImage;
    if (!backgroundImageRegex.test(bgImageStyle)) return;
    const bgImageUrl = bgImageStyle.match(backgroundImageRegex)?.[1];
    if (!bgImageUrl) return;
    const src = `${window.location.origin}/${encodeURI(bgImageUrl)}`;
    addOrUpdate(links, {
      title: element?.title?.trim() || parseSrc(src),
      src,
      type: 'image',
      element: withElements ? element : undefined,
    });
  });

  return [...links.values()];
};

const scrapeLinks = (_document?: Document | null, withElements?: boolean): ScrapedLinks[] => {
  if (!_document) return [];

  const links = new Map<string, ScrapedLinks>();

  _document.querySelectorAll<HTMLElement & { href?: string; src?: string }>(`a[href],link[href],script[src]`)?.forEach(a => {
    const src = a?.href || a?.src;
    if (!src) return;
    addOrUpdate(links, {
      title: a?.title?.trim() || a?.innerText?.trim() || parseSrc(src),
      src,
      type: src?.startsWith('magnet:') ? 'magnet' : 'link',
      element: withElements ? a : undefined,
    });
  });

  return [...links.values()];
};

const scrapePage = (_document?: Document | null, withElements = process.env.DEBUG === 'true'): ScrapedContents => {
  if (!_document) return emptyContents;

  const images = scrapeImages(_document, withElements);
  const audios = scrapeAudios(_document, withElements);
  const videos = scrapeVideos(_document, withElements);
  const links = scrapeLinks(_document, withElements);

  _document.querySelectorAll('iframe')?.forEach(iframe => {
    const link = scrapePage(iframe.contentDocument, withElements);
    audios.push(...link.audios);
    videos.push(...link.videos);
    images.push(...link.images);
    links.push(...link.links);
  });

  return { images, audios, videos, links };
};

export const listenToScrapEvents = () => {
  return onMessage([ChromeMessageType.scrap]).pipe(
    tap(() => {
      const page: ScrapedPage = { title: document?.title ?? window.location.origin, origin: window.location.origin, url: window.location.href };
      const contents = scrapePage(window?.top?.document);
      LoggerService.debug('Scraped contents', { page, contents });
      sendMessage<ScrapedContentsPayload>({ type: ChromeMessageType.scraped, payload: { page, contents } }).subscribe({
        error: error => LoggerService.error('Failed to send scraped event', error),
      });
    }),
  );
};
