import { Subject } from 'rxjs';

import type { ChromeResponse } from '@dvcol/web-extension-utils';

import type { TaskForm, InterceptResponse } from '@src/models';

export type TaskDialogIntercept = { callback: (response?: ChromeResponse<InterceptResponse>) => void };
export type TaskDialogPayload = { open: boolean; form?: TaskForm; intercept?: TaskDialogIntercept };
export const taskDialog$ = new Subject<TaskDialogPayload>();
