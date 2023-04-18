import type { ContentAppHtmlElement, StandaloneAppHtmlElement } from './components.model';
import type { BadgeMock, TaskMock } from '../mocks';

export type SynologyMock = {
  task?: TaskMock;
  badge?: BadgeMock;
};

export type Synology = {
  mock?: SynologyMock;
  content?: ContentAppHtmlElement;
  standalone?: StandaloneAppHtmlElement;
};
