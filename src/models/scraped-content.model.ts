export type ScrapedContent<E extends HTMLElement = HTMLElement> = { title: string; name?: string; src: string; type?: string; element?: E };
export type ScrapedAudio = ScrapedContent<HTMLSourceElement>;
export type ScrapedImages = ScrapedContent<HTMLImageElement | HTMLSourceElement | HTMLElement>;
export type ScrapedVideos = ScrapedContent<HTMLVideoElement | HTMLSourceElement> & { duration?: number };
export type ScrapedLinks = ScrapedContent<HTMLAnchorElement | HTMLElement>;
export type ScrapedContents = { images: ScrapedImages[]; audios: ScrapedAudio[]; videos: ScrapedVideos[]; links: ScrapedLinks[] };

export type ScrapedPage = { title: string; origin: string; url: string };

export const emptyContents: ScrapedContents = { images: [], audios: [], videos: [], links: [] };
