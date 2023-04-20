import type { ContentAppHtmlElement, StandaloneAppHtmlElement } from './components.model';
import type { BadgeMock, FileMock, TaskMock } from '../mocks';

export type SynologyMock = {
  file?: FileMock;
  task?: TaskMock;
  badge?: BadgeMock;
};

export type Synology = {
  mock?: SynologyMock;
  content?: ContentAppHtmlElement;
  standalone?: StandaloneAppHtmlElement;
};
