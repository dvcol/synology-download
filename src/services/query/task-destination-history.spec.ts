import { lastValueFrom, of, throwError } from 'rxjs';

import { ServiceInstance } from '../../models/settings.model';
import { DownloadStationAPI } from '../../models/synology.model';
import { restoreState } from '../../store/actions/state.action';
import { store } from '../../store/store';
import { SynologyDownloadService } from '../http/synology-download.service';
import { NotificationService } from '../notification/notification.service';
import { QueryService } from './query.service';

beforeEach(() => {
  vi.restoreAllMocks();
  store.dispatch(restoreState({
    logged: true,
    history: { destinations: ['downloads/older'], folders: [], logs: [] },
    api: { [DownloadStationAPI.Task]: { path: 'DownloadStation/task.cgi', minVersion: 1, maxVersion: 3 } },
  }));
  QueryService.init(store, ServiceInstance.Background);
  vi.spyOn(SynologyDownloadService.prototype, 'createTask').mockReturnValue(of(undefined));
  vi.spyOn(SynologyDownloadService.prototype, 'listTasks').mockReturnValue(of({ total: 0, offset: 0, tasks: [] }));
  vi.spyOn(NotificationService, 'taskCreated').mockImplementation(() => {});
  vi.spyOn(NotificationService, 'error').mockImplementation(() => {});
});
afterEach(() => {
  QueryService.destroy();
  vi.restoreAllMocks();
});

describe('successful task destination history', () => {
  it('records the successfully created folder as the newest and deduplicates it', async () => {
    expect.assertions(2);
    await lastValueFrom(QueryService.createTask({ url: ['https://example.com/file.zip'], destination: ' downloads/newest ' }));
    await lastValueFrom(QueryService.createTask({ url: ['https://example.com/other.zip'], destination: 'downloads/newest' }));
    expect(store.getState().state.history.destinations).toEqual(['downloads/newest', 'downloads/older']);
    expect(NotificationService.taskCreated).toHaveBeenCalledTimes(2);
  });

  it('does not record an implicit NAS default folder', async () => {
    expect.assertions(1);
    await lastValueFrom(QueryService.createTask({ url: ['https://example.com/file.zip'] }));
    expect(store.getState().state.history.destinations).toEqual(['downloads/older']);
  });

  it('preserves history when the NAS rejects task creation', async () => {
    expect.assertions(4);
    vi.mocked(SynologyDownloadService.prototype.createTask).mockReturnValue(throwError(() => new Error('NAS rejected task')));
    await expect(lastValueFrom(QueryService.createTask({ url: ['https://example.com/file.zip'], destination: 'downloads/failed' }))).rejects.toThrow('NAS rejected task');
    expect(store.getState().state.history.destinations).toEqual(['downloads/older']);
    expect(NotificationService.taskCreated).not.toHaveBeenCalled();
    expect(NotificationService.error).toHaveBeenCalledOnce();
  });
});
