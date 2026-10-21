/// <reference types="chrome" />
import { of, throwError } from 'rxjs';

import { ContentSource } from '../../models/content.model';
import { defaultSettings, SyncSettingMode } from '../../models/settings.model';
import { DownloadStationAPI } from '../../models/synology.model';
import { TaskStatus, TaskType } from '../../models/task.model';
import { DownloadService } from '../../services/download/download.service';
import { SynologyAuthService } from '../../services/http/synology-auth.service';
import { SynologyDownloadService } from '../../services/http/synology-download.service';
import { SynologyInfoService } from '../../services/http/synology-info.service';
import { LoggerService } from '../../services/logger/logger.service';
import { NotificationService } from '../../services/notification/notification.service';
import { PollingService } from '../../services/polling/polling.service';
import { QueryService } from '../../services/query/query.service';
import { store } from '../../store/store';
import { initServiceWorker } from './init-service-worker';
import { watchContextMenuVisibility } from './modules/context-menu-visibility';
import { registerPollingAlarm, watchPollingAlarm } from './modules/polling-alarm';

vi.mock('webext-redux', () => ({ createWrapStore: vi.fn(() => vi.fn()) }));

const task = { source: ContentSource.Task, key: 'fixture', id: 'fixture', title: 'Fixture download', type: TaskType.http, username: 'test', size: 1000, status: TaskStatus.downloading };
const api = { [DownloadStationAPI.Task]: { path: 'DownloadStation/task.cgi', minVersion: 1, maxVersion: 3 } };
const alarmListeners = new Set<(alarm: chrome.alarms.Alarm) => void>();
const alarms = {
  get: vi.fn().mockResolvedValue(undefined),
  create: vi.fn().mockResolvedValue(undefined),
  clear: vi.fn().mockResolvedValue(true),
  onAlarm: {
    addListener: (listener: (alarm: chrome.alarms.Alarm) => void) => {
      alarmListeners.add(listener);
    },
    hasListener: (listener: (alarm: chrome.alarms.Alarm) => void) => alarmListeners.has(listener),
  },
};
let savedSettings = defaultSettings;
let taskStatus = TaskStatus.downloading;

beforeEach(() => {
  vi.useFakeTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  alarmListeners.clear();
  Object.defineProperty(chrome, 'alarms', { configurable: true, value: alarms });
  Object.defineProperty(chrome.runtime, 'onConnect', { configurable: true, value: { addListener: vi.fn(), removeListener: vi.fn() } });
  Object.defineProperty(chrome.downloads, 'onDeterminingFilename', { configurable: true, value: { addListener: vi.fn(), removeListener: vi.fn() } });
  vi.mocked(chrome.runtime.getManifest).mockReturnValue({ manifest_version: 3, name: 'Test extension', version: '4.2.0' });
  vi.mocked(chrome.action.setBadgeText).mockResolvedValue(undefined);
  vi.mocked(chrome.action.setTitle).mockResolvedValue(undefined);
  vi.mocked(chrome.action.setIcon).mockResolvedValue(undefined);
  vi.mocked(chrome.action.setBadgeBackgroundColor).mockResolvedValue(undefined);
  vi.mocked(chrome.notifications.create).mockImplementation(async () => 'completed-task');
  vi.mocked(chrome.downloads.search).mockImplementation(async () => []);
  vi.mocked(chrome.contextMenus.create).mockImplementation((_properties, callback) => {
    callback?.();
    return 'menu';
  });
  vi.mocked(chrome.contextMenus.update).mockImplementation(async (_id, _properties, callback) => {
    callback?.();
    return Promise.resolve();
  });
  vi.mocked(chrome.contextMenus.remove).mockImplementation(async (_id, callback) => {
    callback?.();
    return Promise.resolve();
  });
  vi.spyOn(console, 'info').mockImplementation(() => {});
  savedSettings = {
    ...defaultSettings,
    sync: { mode: SyncSettingMode.local },
    connection: { ...defaultSettings.connection, password: 'test-password', autoLogin: true, rememberMe: true },
    downloads: { ...defaultSettings.downloads, enabled: false },
    advanced: { ...defaultSettings.advanced, logging: { ...defaultSettings.advanced.logging, enabled: false } },
  };
  vi.mocked(chrome.storage.local.get).mockImplementation(async () => ({
    settings: JSON.stringify(savedSettings),
    state: JSON.stringify({ logged: true, history: { destinations: ['downloads/restored'], folders: [], logs: [] }, api }),
    tasks: JSON.stringify({ tasks: { fixture: task }, tasksIds: ['fixture'] }),
  }));
  taskStatus = TaskStatus.downloading;
  vi.spyOn(SynologyAuthService.prototype, 'login').mockReturnValue(of({ sid: 'restored-session' }));
  vi.spyOn(SynologyInfoService.prototype, 'info').mockReturnValue(of(api));
  vi.spyOn(SynologyDownloadService.prototype, 'listTasks').mockImplementation(() => of({ total: 1, offset: 0, tasks: [{ ...task, status: taskStatus }] }));
  vi.spyOn(SynologyDownloadService.prototype, 'getStatistic').mockReturnValue(of({ speed_download: 0, speed_upload: 0, emule_speed_download: 0, emule_speed_upload: 0 }));
});

afterEach(() => {
  watchPollingAlarm(store).unsubscribe();
  watchContextMenuVisibility(store).unsubscribe();
  PollingService.destroy();
  QueryService.destroy();
  NotificationService.destroy();
  DownloadService.destroy();
  LoggerService.destroy();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('worker restoration and background polling', () => {
  it('restores settings, login, history, tasks and badge updates before polling', async () => {
    expect.assertions(8);
    registerPollingAlarm();
    await initServiceWorker();
    expect(store.getState().tasks.tasks.fixture).toEqual(task);
    await vi.advanceTimersByTimeAsync(0);
    expect(store.getState().settings.connection.password).toBe('test-password');
    expect(store.getState().state.logged).toBe(true);
    expect(store.getState().state.sid).toBe('restored-session');
    expect(store.getState().state.history.destinations).toEqual(['downloads/restored']);
    expect(SynologyDownloadService.prototype.listTasks).toHaveBeenCalledOnce();
    expect(chrome.action.setBadgeText).toHaveBeenCalledWith({ text: '1' });
    expect(alarms.create).toHaveBeenCalledWith('synology-download-polling-recovery', { periodInMinutes: 1 });
  });

  it.each(['disabled', 'rejected'] as const)('does not fake authenticated NAS polling when login is %s', async (scenario) => {
    expect.assertions(3);
    if (scenario === 'disabled') savedSettings = { ...savedSettings, connection: { ...savedSettings.connection, autoLogin: false } };
    else vi.mocked(SynologyAuthService.prototype.login).mockReturnValue(throwError(() => new Error('Invalid credentials')));
    await initServiceWorker();
    await vi.advanceTimersByTimeAsync(60000);
    expect(store.getState().state.logged).toBe(false);
    expect(SynologyDownloadService.prototype.listTasks).not.toHaveBeenCalled();
    expect(SynologyAuthService.prototype.login).toHaveBeenCalledTimes(scenario === 'disabled' ? 0 : 1);
  });

  it('keeps the configured polling cadence and emits one completion notification after reinitialization', async () => {
    expect.assertions(5);
    registerPollingAlarm();
    await initServiceWorker();
    await initServiceWorker();
    await vi.advanceTimersByTimeAsync(0);
    expect(SynologyDownloadService.prototype.listTasks).toHaveBeenCalledOnce();
    taskStatus = TaskStatus.finished;
    for (const listener of alarmListeners) listener({ name: 'synology-download-polling-recovery', scheduledTime: 0 });
    await vi.advanceTimersByTimeAsync(20200);
    expect(store.getState().tasks.tasks.fixture.status).toBe(TaskStatus.finished);
    expect(chrome.notifications.create).toHaveBeenCalledOnce();
    for (const listener of alarmListeners) listener({ name: 'synology-download-polling-recovery', scheduledTime: 0 });
    await vi.advanceTimersByTimeAsync(20000);
    expect(SynologyDownloadService.prototype.listTasks).toHaveBeenCalledTimes(3);
    expect(chrome.notifications.create).toHaveBeenCalledOnce();
  });
});
