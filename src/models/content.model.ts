import type { TabCount, TabStatus } from './tab.model';

export enum ContentSource {
  Task = 'task',
  Download = 'download',
}

export interface Content {
  source: ContentSource;
  id: string | number;
  key: string;
  status: TabStatus;
  title?: string;
  folder?: string;
  progress?: number;
  speed?: number;
  size?: number;
  received?: number;
  eta?: string;
  createdAt?: number;
  finishedAt?: number;
}

/**
 * Enumeration for possible task types
 */
export enum ContentStatusType {
  all = 'all',
  active = 'active',
  downloading = 'downloading',
  paused = 'paused',
  finished = 'finished',
  finishing = 'finishing',
  error = 'error',
}

export type ContentTypeId<T = Content['id']> = { source: ContentSource; key: Content['key']; id: T };
export type ContentStatusTypeId<T = ContentTypeId<Content['id']>> = Record<ContentStatusType, Set<T>>;

export interface ContentCount {
  badge: number;
  total: number;
  tabs: TabCount;
}
