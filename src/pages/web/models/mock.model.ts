import type { BadgeMock, DownloadMock, FileMock, TaskMock } from '../mocks';
import type { ContentAppHtmlElement, StandaloneAppHtmlElement } from './components.model';

export interface SynologyMock {
  download?: DownloadMock;
  task?: TaskMock;
  file?: FileMock;
  badge?: BadgeMock;
}

export interface Synology {
  mock?: SynologyMock;
  content?: ContentAppHtmlElement;
  standalone?: StandaloneAppHtmlElement;
}
