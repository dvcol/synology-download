import { faker } from '@faker-js/faker/locale/en';

import type { Task } from '@src/models';
import { TaskPriority, TaskStatus, TaskType } from '@src/models';

import { FetchIntercept } from '../models';

import { AbstractMock, resolveUrl } from './utils.mock';

/**
 * Extends Partial to make all own properties also Partial
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]> | T[P];
};

/**
 * Generate a Task
 * @todo: move from faker to a three-shakable smaller lib
 */
export const generateTask = (_task: RecursivePartial<Task> = {}): Task => {
  const status =
    _task.status ??
    faker.helpers.arrayElement([...Object.values(TaskStatus), ...Array(10).fill([TaskStatus.downloading, TaskStatus.waiting]).flat()]);
  const size = _task.size ?? faker.datatype.number({ min: 1000, max: 1000000000 });

  const create_time = _task?.additional?.detail?.create_time ?? faker.date.recent().getTime();
  const started_time = _task?.additional?.detail?.started_time ?? faker.date.between(create_time, new Date()).getTime();
  const elapsed = (new Date().getTime() - started_time) / 1000;

  let size_downloaded =
    _task?.additional?.transfer?.size_downloaded ??
    faker.datatype.number({
      min: 0,
      max: size / 10,
    });
  if ([TaskStatus.finished, TaskStatus.seeding, TaskStatus.extracting, TaskStatus.finishing].includes(status)) size_downloaded = size;
  const size_uploaded = _task?.additional?.transfer?.size_uploaded ?? faker.datatype.number({ min: 0, max: size / 10 });
  const speed_download = Math.round(_task?.additional?.transfer?.speed_download ?? Number(size_downloaded) / elapsed);
  const speed_upload = Math.round(_task?.additional?.transfer?.speed_upload ?? Number(size_uploaded) / elapsed);
  return {
    id: `dbid_${faker.datatype.uuid()}`,
    size,
    status,
    title: faker.system.commonFileName(),
    type: faker.helpers.arrayElement(Object.values(TaskType)),
    username: faker.internet.userName(),
    ..._task,
    additional: {
      detail: {
        completed_time: [TaskStatus.finished, TaskStatus.seeding].includes(status) ? faker.date.past().getTime() : 0,
        connected_leechers: faker.datatype.number(1000),
        connected_peers: faker.datatype.number(1000),
        connected_seeders: faker.datatype.number(1000),
        create_time,
        started_time,
        destination: faker.system.directoryPath(),
        seedelapsed: 0,
        total_peers: faker.datatype.number(1000),
        total_pieces: faker.datatype.number(1000),
        unzip_password: '',
        uri: faker.internet.url(),
        waiting_seconds: 0,
        priority: faker.helpers.arrayElement(Object.values(TaskPriority)),
        ..._task?.additional?.detail,
      },
      transfer: {
        downloaded_pieces: 0,
        size_downloaded,
        size_uploaded,
        speed_download,
        speed_upload,
        ..._task?.additional?.transfer,
      },
    },
  } as Task;
};

type TaskEntities = Record<string, Task>;

const defaultTasks: TaskEntities = Array(5)
  .fill(undefined)
  .reduce(acc => {
    const _task = generateTask();
    acc[_task.id] = _task;
    return acc;
  }, {});

const storageKey = 'synology.mock.task';

const getTasks = (): TaskEntities => {
  const storage = localStorage.getItem(storageKey);
  if (storage) return JSON.parse(storage);
  localStorage.setItem(storageKey, JSON.stringify(defaultTasks));
  return defaultTasks;
};

export class TaskMock extends AbstractMock<TaskEntities> {
  readonly key = storageKey;

  constructor(entities = getTasks()) {
    super(entities);
  }

  get ids(): string[] {
    return Object.keys(this.entities);
  }

  get tasks(): Task[] {
    return Object.values(this.entities);
  }

  get length(): number {
    return this.ids.length;
  }

  add(task: Task = generateTask()) {
    this.entities[task.id] = task;
    super.publish();
    return this.entities;
  }

  remove(id: Task['id']) {
    super.publish();
    return delete this.entities[id];
  }

  resume(id: Task['id']) {
    const task = this.entities[id];
    if (!task) return;
    switch (task.status) {
      case TaskStatus.paused:
        task.status = TaskStatus.downloading;
        break;
      case TaskStatus.finished:
        task.status = TaskStatus.seeding;
        break;
      case TaskStatus.error:
        task.status = TaskStatus.downloading;
        if (task.additional?.transfer) task.additional.transfer.size_downloaded = 0;
        break;
      default:
        break;
    }
  }

  pause(id: Task['id']) {
    const task = this.entities[id];
    if (!task) return;
    if ([TaskStatus.finished, TaskStatus.error, TaskStatus.paused].includes(task.status)) return;
    task.status = TaskStatus.paused;
  }
}

const changeStatus = (task: Task, status: TaskStatus, threshold = 50000): Task => {
  if (faker.datatype.number(100000) > threshold) task.status = status;
  return task;
};

const failTask = (task: Task) => changeStatus(task, TaskStatus.error, 99999);

const computeSpeed = (task: Task) => {
  const started_time = task?.additional?.detail?.started_time;
  const size_downloaded = task?.additional?.transfer?.size_downloaded;
  const size_uploaded = task?.additional?.transfer?.size_uploaded;

  if (started_time === undefined || size_downloaded === undefined || size_uploaded === undefined)
    return {
      speed_download: 0,
      speed_upload: 0,
    };

  const elapsed = (new Date().getTime() - started_time) / 1000;

  const speed_download = Math.round(Number(size_downloaded) / elapsed);
  const speed_upload = Math.round(Number(size_uploaded) / elapsed);
  return { speed_download, speed_upload };
};

const progress = (task: Task) => {
  if (!task.additional?.transfer.size_downloaded) return task;
  const total = task.size;
  const downloaded = Number(task.additional.transfer.size_downloaded);
  if (total / downloaded < 1.05) {
    task.status = TaskStatus.finished;
    task.additional.transfer.size_downloaded = total;
    task.additional.transfer.speed_download = 0;
    return task;
  }
  if (faker.datatype.number(100) > 20) {
    const max = (total - downloaded) / faker.datatype.number({ min: 5, max: 500 });
    const size_downloaded = downloaded + faker.datatype.number({ max });
    const { speed_upload, speed_download } = computeSpeed(task);
    task.additional.transfer = { ...task.additional.transfer, size_downloaded, speed_download, speed_upload };
  }
  return task;
};

const seed = (task: Task) => {
  if (!task.additional?.transfer.size_uploaded) return task;
  if (faker.datatype.number(100) > 20) {
    task.additional.transfer.size_uploaded = faker.datatype.number({ max: task.size / 4 });
    task.additional.transfer.speed_upload = computeSpeed(task).speed_upload;
  }
  return task;
};

export const activateDemo = (task: TaskMock, interval = 100) => {
  return setInterval(() => {
    task.tasks.forEach(_task => {
      switch (_task.status) {
        case TaskStatus.downloading:
          failTask(_task);
          progress(_task);
          break;
        case TaskStatus.seeding:
          failTask(_task);
          seed(_task);
          break;
        case TaskStatus.extracting:
        case TaskStatus.finishing:
          failTask(_task);
          changeStatus(_task, TaskStatus.finished);
          break;
        case TaskStatus.waiting:
        case TaskStatus.hash_checking:
        case TaskStatus.filehosting_waiting:
          failTask(_task);
          changeStatus(_task, TaskStatus.downloading);
          break;
        case TaskStatus.error:
        case TaskStatus.paused:
        case TaskStatus.finished:
        default:
          break;
      }
    });
  }, interval);
};

export const patchTasks = (_global = window): TaskMock => {
  if (!_global._synology) _global._synology = {};
  if (!_global._synology.mock) _global._synology.mock = {};
  if (!_global._synology.mock.task) _global._synology.mock.task = new TaskMock();
  const { task } = _global._synology.mock;

  if (!_global._fetchIntercept) _global._fetchIntercept = new FetchIntercept();

  // list
  _global._fetchIntercept?.push([
    (input, init) => {
      if (!resolveUrl(input)?.endsWith('DownloadStation/task.cgi')) return false;
      return !!init?.body?.toString()?.includes('api=SYNO.DownloadStation.Task&method=list');
    },
    () => ({ offset: 0, tasks: task.tasks, total: 1 }),
  ]);

  // delete
  _global._fetchIntercept?.push([
    (input, init) => {
      if (!resolveUrl(input)?.endsWith('DownloadStation/task.cgi')) return false;
      return !!init?.body?.toString()?.includes('api=SYNO.DownloadStation.Task&method=delete');
    },
    (_, init) => {
      const id = init?.body?.toString()?.match(/id=(.*?(?=&|$))/)?.[1];
      if (id) id.split('%2C')?.forEach(_id => task.remove(_id));
      return { error: 0, id };
    },
  ]);

  // resume
  _global._fetchIntercept?.push([
    (input, init) => {
      if (!resolveUrl(input)?.endsWith('DownloadStation/task.cgi')) return false;
      return !!init?.body?.toString()?.includes('api=SYNO.DownloadStation.Task&method=resume');
    },
    (_, init) => {
      const id = init?.body?.toString()?.match(/id=(.*?(?=&|$))/)?.[1];
      if (id) id.split('%2C')?.forEach(_id => task.resume(_id));
      return { error: 0, id };
    },
  ]);

  // pause
  _global._fetchIntercept?.push([
    (input, init) => {
      if (!resolveUrl(input)?.endsWith('DownloadStation/task.cgi')) return false;
      return !!init?.body?.toString()?.includes('api=SYNO.DownloadStation.Task&method=pause');
    },
    (_, init) => {
      const id = init?.body?.toString()?.match(/id=(.*?(?=&|$))/)?.[1];
      if (id) id.split('%2C')?.forEach(_id => task.pause(_id));
      return { error: 0, id };
    },
  ]);

  // create
  _global._fetchIntercept?.push([
    (input, init) => {
      if (!resolveUrl(input)?.endsWith('DownloadStation/task.cgi')) return false;
      return !!init?.body?.toString()?.includes('api=SYNO.DownloadStation.Task&method=create');
    },
    (_, init) => {
      const uri = init?.body?.toString()?.match(/uri=(.*?(?=&|$))/)?.[1];
      const destination = init?.body?.toString()?.match(/destination=(.*?(?=&|$))/)?.[1];
      if (uri)
        uri.split('%2C')?.forEach(_uri =>
          task.add(
            generateTask({
              additional: {
                detail: {
                  destination: destination ? decodeURIComponent(destination) : destination,
                  uri: decodeURIComponent(_uri),
                },
              },
            }),
          ),
        );
      return { error: 0 };
    },
  ]);

  return task;
};
