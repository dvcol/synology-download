/// <reference types="chrome" />
import type { DownloadStationConfig } from '../../../models/download-station.model';
import type { ContextMenu } from '../../../models/menu.model';

import { act, fireEvent } from '@testing-library/react';
import { of } from 'rxjs';

import { defaultContextMenu } from '../../../models/menu.model';
import { ChromeMessageType } from '../../../models/message.model';
import { SynologyDownloadService } from '../../../services/http/synology-download.service';
import { SynologyFileService } from '../../../services/http/synology-file.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { QueryService } from '../../../services/query/query.service';
import { restoreState } from '../../../store/actions/state.action';
import { clearTaskForm } from '../../../store/actions/tasks.action';
import { store } from '../../../store/store';
import { renderWithProviders } from '../../../test/render-helper';
import { ContentTaskDialog } from './content-task-dialog';

vi.mock('../../../store/store-proxy', async () => {
  const { store: proxyStore } = await import('../../../store/store');
  return { storeProxy: proxyStore };
});

const menu: ContextMenu = { ...defaultContextMenu, id: 'menu-test', modal: false };
const linkUrl = 'https://example.com/file.zip';
const pageUrl = 'https://example.com/source';

function sendMenuClick(destination: ContextMenu['destination'], options: Partial<ContextMenu> = {}, uri = linkUrl) {
  const message = { type: ChromeMessageType.clickMenu, payload: { info: { menuItemId: menu.id, linkUrl: uri, pageUrl }, menu: { ...menu, ...options, destination } } };
  for (const [listener] of vi.mocked(chrome.runtime.onMessage.addListener).mock.calls) listener(message, {}, vi.fn());
}

beforeEach(() => {
  vi.restoreAllMocks();
  vi.mocked(chrome.runtime.onMessage.addListener).mockClear();
  store.dispatch(clearTaskForm());
  store.dispatch(restoreState({ logged: true, history: { destinations: ['downloads/newest', 'downloads/older'], folders: [], logs: [] } }));
  vi.spyOn(QueryService, 'createTask').mockReturnValue(of(undefined));
  vi.spyOn(SynologyDownloadService.prototype, 'getConfig').mockReturnValue(of({ default_destination: 'downloads/default' } as DownloadStationConfig));
  vi.spyOn(SynologyFileService.prototype, 'listFolder').mockReturnValue(of({ total: 0, offset: 0, shares: [] }));
  vi.spyOn(SynologyFileService.prototype, 'listFile').mockReturnValue(of({ total: 0, offset: 0, files: [] }));
  vi.spyOn(chrome.runtime, 'sendMessage').mockImplementation((...parameters: unknown[]) => {
    const callback = parameters.at(-1) as (response: unknown) => void;
    callback({ success: true });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('context-menu destinations', () => {
  it.each([
    { destination: { custom: false }, expected: undefined },
    { destination: { custom: true, path: 'downloads/fixed' }, expected: 'downloads/fixed' },
    { destination: { custom: false, lastUsed: true }, expected: 'downloads/newest' },
  ])('routes a direct HTTP task to $expected', ({ destination, expected }) => {
    expect.assertions(2);
    renderWithProviders(<ContentTaskDialog />);
    act(() => sendMenuClick(destination));
    expect(QueryService.createTask).toHaveBeenCalledExactlyOnceWith({ url: [linkUrl], destination: expected }, { source: pageUrl });
    expect(store.getState().state.history.destinations).toEqual(['downloads/newest', 'downloads/older']);
  });

  it('reads updated history when clicked, without remounting', () => {
    expect.assertions(1);
    renderWithProviders(<ContentTaskDialog />);
    act(() => {
      store.dispatch(restoreState({ history: { destinations: ['downloads/changed'], folders: [], logs: [] } }));
    });
    act(() => sendMenuClick({ custom: false, lastUsed: true }));
    expect(QueryService.createTask).toHaveBeenCalledExactlyOnceWith({ url: [linkUrl], destination: 'downloads/changed' }, { source: pageUrl });
  });

  it('uses the NAS default folder without destination history', () => {
    expect.assertions(1);
    store.dispatch(restoreState({ history: { destinations: [], folders: [], logs: [] } }));
    renderWithProviders(<ContentTaskDialog />);
    act(() => sendMenuClick({ custom: false, lastUsed: true, path: 'stale/path' }));
    expect(QueryService.createTask).toHaveBeenCalledExactlyOnceWith({ url: [linkUrl], destination: undefined }, { source: pageUrl });
  });

  it.each([
    { options: { popup: true }, type: ChromeMessageType.openTaskPopup },
    { options: { panel: true }, type: ChromeMessageType.openTaskPanel },
  ])('forwards the resolved folder through $type', ({ options, type }) => {
    expect.assertions(2);
    renderWithProviders(<ContentTaskDialog />);
    act(() => sendMenuClick({ custom: false, lastUsed: true }, options));
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ type, payload: { form: { uri: linkUrl, source: pageUrl, destination: { custom: true, path: 'downloads/newest' } } } }, expect.any(Function));
    expect(QueryService.createTask).not.toHaveBeenCalled();
  });

  it('keeps the resolved folder when submitting the existing modal', async () => {
    expect.assertions(2);
    const { findByRole, getByRole } = renderWithProviders(<ContentTaskDialog />);
    act(() => sendMenuClick({ custom: false, lastUsed: true }, { modal: true }));
    const dialog = await findByRole('dialog');
    expect((dialog.querySelector('input[name="destination.custom"]') as HTMLInputElement).checked).toBe(true);
    await act(async () => {
      fireEvent.click(getByRole('button', { name: 'common__buttons__create' }));
    });
    expect(QueryService.createTask).toHaveBeenCalledWith(expect.objectContaining({ url: [linkUrl], destination: 'downloads/newest' }), expect.objectContaining({ source: pageUrl }));
  });

  it('requires login before creating a task', () => {
    expect.assertions(2);
    store.dispatch(restoreState({ logged: false }));
    const loginRequired = vi.spyOn(NotificationService, 'loginRequired').mockImplementation(() => {});
    renderWithProviders(<ContentTaskDialog />);
    act(() => sendMenuClick({ custom: false, lastUsed: true }));
    expect(loginRequired).toHaveBeenCalledOnce();
    expect(QueryService.createTask).not.toHaveBeenCalled();
  });

  it('reports missing links without creating a task', () => {
    expect.assertions(2);
    const notifyError = vi.spyOn(NotificationService, 'error').mockImplementation(() => {});
    renderWithProviders(<ContentTaskDialog />);
    act(() => sendMenuClick({ custom: false, lastUsed: true }, {}, ''));
    expect(notifyError).toHaveBeenCalledOnce();
    expect(QueryService.createTask).not.toHaveBeenCalled();
  });
});
