import { Subject } from 'rxjs';

import type { TaskForm } from '@src/models';

export type TaskDialogPayload = { open: boolean; form?: TaskForm };
export const taskDialog$ = new Subject<TaskDialogPayload>();
