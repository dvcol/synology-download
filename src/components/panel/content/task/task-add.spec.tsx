import type { TaskForm } from '../../../../models/task.model';

import { act, fireEvent, waitFor } from '@testing-library/react';
import { of } from 'rxjs';

import { SynologyFileService } from '../../../../services/http/synology-file.service';
import { QueryService } from '../../../../services/query/query.service';
import { restoreState } from '../../../../store/actions/state.action';
import { clearTaskForm, setTaskForm } from '../../../../store/actions/tasks.action';
import { store } from '../../../../store/store';
import { renderWithProviders } from '../../../../test/render-helper';
import { TaskAdd } from './task-add';

beforeEach(() => {
  vi.restoreAllMocks();
  store.dispatch(restoreState({ logged: true }));
  store.dispatch(clearTaskForm());
  vi.spyOn(QueryService, 'createTask').mockReturnValue(of(undefined));
  vi.spyOn(SynologyFileService.prototype, 'listFolder').mockReturnValue(of({ total: 0, offset: 0, shares: [] }));
  vi.spyOn(SynologyFileService.prototype, 'listFile').mockReturnValue(of({ total: 0, offset: 0, files: [] }));
});
afterEach(() => vi.restoreAllMocks());

describe('task-add destination prefilling', () => {
  it.each([
    { form: { custom: true, path: 'downloads/incoming' }, saved: { custom: true, path: 'downloads/stale' }, expected: 'downloads/incoming' },
    { form: { custom: false, path: 'downloads/default' }, saved: { custom: true, path: 'downloads/stale' }, expected: undefined },
    { form: undefined, saved: { custom: true, path: 'downloads/saved' }, expected: 'downloads/saved' },
  ])('submits the intended folder: $expected', async ({ form, saved, expected }) => {
    expect.assertions(3);
    store.dispatch(setTaskForm({ destination: saved }));
    const taskForm: TaskForm = { uri: 'https://example.com/file.zip', source: 'Context menu', destination: form };
    const { container, getByRole } = renderWithProviders(<TaskAdd form={taskForm} />);
    const toggle = container.querySelector('input[name="destination.custom"]') as HTMLInputElement;
    expect(toggle.checked).toBe(expected !== undefined);
    const createButton = getByRole('button', { name: 'common__buttons__create' }) as HTMLButtonElement;
    await waitFor(() => {
      if (createButton.disabled) throw new Error('Task form is not valid yet');
    }, { timeout: 10000 });
    await act(async () => {
      fireEvent.click(createButton);
    });
    const request = vi.mocked(QueryService.createTask).mock.calls[0];
    expect(request[0].destination).toBe(expected);
    expect(request[1]?.source).toBe('Context menu');
  }, 15000);
});
