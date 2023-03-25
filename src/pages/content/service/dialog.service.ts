import { Subject } from 'rxjs';

import type { TaskForm, InterceptResponse } from '@src/models';
import type { ChromeResponse } from '@src/utils';

export type TaskDialogIntercept = { callback: (response?: ChromeResponse<InterceptResponse>) => void };
export type TaskDialogPayload = { open: boolean; form?: TaskForm; intercept?: TaskDialogIntercept };
export const taskDialog$ = new Subject<TaskDialogPayload>();
