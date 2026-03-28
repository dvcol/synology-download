import type { TaskForm } from '../../../models/task.model';

import { Subject } from 'rxjs';

export interface AnchorPayload { event?: MouseEvent; anchor?: Element | null; form: TaskForm }
export const anchor$ = new Subject<AnchorPayload>();

export interface ClickPayload { event: MouseEvent; anchor?: Element | null }
export const lastClick$ = new Subject<ClickPayload>();
