import { faker } from '@faker-js/faker/locale/en';

import type { Task } from '@src/models';
import { TaskPriority, TaskStatus, TaskType } from '@src/models';

/**
 * Generate a Task
 * @todo: move from faker to a three-shakable smaller lib
 */
export const generateTask = (_task: Partial<Task> = {}): Task => {
  const status = _task.status ?? faker.helpers.arrayElement(Object.values(TaskStatus));
  const size = _task.size ?? faker.datatype.number({ min: 1000, max: 1000000000 });

  const create_time = _task?.additional?.detail?.create_time ?? faker.date.recent().getTime();
  const started_time = _task?.additional?.detail?.started_time ?? faker.date.between(create_time, new Date()).getTime();
  const elapsed = (new Date().getTime() - started_time) / 1000;

  const size_downloaded = _task?.additional?.transfer?.size_downloaded ?? faker.datatype.number({ min: 0, max: size / 1.5 });
  const size_uploaded = _task?.additional?.transfer?.size_uploaded ?? faker.datatype.number({ min: 0, max: size / 1.5 });
  const speed_download = Math.round(_task?.additional?.transfer?.speed_download ?? (size - Number(size_downloaded)) / elapsed);
  const speed_upload = Math.round(_task?.additional?.transfer?.speed_upload ?? (size - Number(size_uploaded)) / elapsed);
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
