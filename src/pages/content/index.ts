import { addAnchorClickListener } from './modules';
import { Subject } from 'rxjs';
import { TaskForm } from '@src/models';
import { renderContentApp } from './components';

console.log('Content script works!');

export type AnchorPayload = { event: MouseEvent; anchor: Element | null; form: TaskForm };
export const anchor$ = new Subject<AnchorPayload>();

export type TaskDialogPayload = { open: boolean; form?: TaskForm };
export const taskDialog$ = new Subject<TaskDialogPayload>();

addAnchorClickListener();
renderContentApp();
