import { Subject } from 'rxjs';

import type { TaskForm } from '@src/models';

export type AnchorPayload = { event?: MouseEvent; anchor?: Element | null; form: TaskForm };
export const anchor$ = new Subject<AnchorPayload>();

export type ClickPayload = { event: MouseEvent; anchor?: Element | null };
export const lastClick$ = new Subject<ClickPayload>();
