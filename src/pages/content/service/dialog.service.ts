import type { InterceptResponse, TaskForm } from '@src/models';
import type { ChromeResponse } from '@src/utils';

import { Subject } from 'rxjs';

export interface TaskDialogIntercept { callback: (response?: ChromeResponse<InterceptResponse>) => void }
export interface TaskDialogPayload { open: boolean; form?: TaskForm; intercept?: TaskDialogIntercept }
export const taskDialog$ = new Subject<TaskDialogPayload>();
