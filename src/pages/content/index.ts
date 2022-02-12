import { addAnchorClickListener } from './modules';
import { Subject } from 'rxjs';
import { TaskForm } from '@src/models';
import { renderContentApp } from './components';

console.debug('Content script injected.');

// TODO: keep MV3 alive ?
// @see https://bugs.chromium.org/p/chromium/issues/detail?id=1152255

export type AnchorPayload = { event: MouseEvent; anchor: Element | null; form: TaskForm };
export const anchor$ = new Subject<AnchorPayload>();

export type TaskDialogPayload = { open: boolean; form?: TaskForm };
export const taskDialog$ = new Subject<TaskDialogPayload>();

addAnchorClickListener();
renderContentApp();
