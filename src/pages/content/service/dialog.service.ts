import type { InterceptResponse } from '../../../models/message.model';
import type { TaskForm } from '../../../models/task.model';
import type { ChromeResponse } from '../../../utils/webex.utils';

import { Subject } from 'rxjs';

export interface TaskDialogIntercept { callback: (response?: ChromeResponse<InterceptResponse>) => void }
export interface TaskDialogPayload { open: boolean; form?: TaskForm; intercept?: TaskDialogIntercept }
export const taskDialog$ = new Subject<TaskDialogPayload>();
