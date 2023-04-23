import type { ContentAppHtmlElement, StandaloneAppHtmlElement } from './components.model';
import type { BadgeMock, DownloadMock, FileMock, TaskMock } from '../mocks';

export type SynologyMock = {
  download?: DownloadMock;
  task?: TaskMock;
  file?: FileMock;
  badge?: BadgeMock;
};

export type Synology = {
  mock?: SynologyMock;
  content?: ContentAppHtmlElement;
  standalone?: StandaloneAppHtmlElement;
};
