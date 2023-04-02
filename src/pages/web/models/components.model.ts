import type { Store } from 'redux';

export enum WebComponents {
  StandaloneApp = `wc-synology-download-standalone`,
  ContentApp = `wc-synology-download-content`,
}

export type ContentAppTaskForm = {
  uri?: string;
  source?: string; // Custom Task
  destination?: { custom?: boolean; path?: string };
  username?: string;
  password?: string;
  extract_password?: string; // unzip password
  torrent?: string;
  create_list?: boolean;
};
export type ContentAppAnchorPayload = { event: MouseEvent; anchor: Element | null; form: ContentAppTaskForm };
export type ContentAppTaskDialogPayload = { open: boolean; form?: ContentAppTaskForm; intercept?: () => void };

export interface ContentAppHtmlElement extends HTMLElement {
  render: (root?: Element, store?: Store) => void;
  anchor: (payload: ContentAppAnchorPayload) => void;
  dialog: (payload: ContentAppTaskDialogPayload) => void;
}

export interface StandaloneAppHtmlElement extends HTMLElement {
  basename?: string;
  render: (root?: Element, store?: Store) => void;
}
