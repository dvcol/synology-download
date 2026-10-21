import type { Subscription } from 'rxjs';

import type { StoreOrProxy } from '../../../models/store.model';

import { saveContextMenu } from '@dvcol/web-extension-utils';
import { catchError, combineLatest, concatMap, distinctUntilChanged, EMPTY, forkJoin, map } from 'rxjs';

import { LoggerService } from '../../../services/logger/logger.service';
import { getMenus } from '../../../store/selectors/settings.selector';
import { getDestinationsHistory } from '../../../store/selectors/state.selector';
import { store$ } from '../../../utils/rxjs.utils';

let visibilitySubscription: Subscription | undefined;

/** Keep unavailable recent destinations hidden without removing the only download action. */
export function watchContextMenuVisibility(store: StoreOrProxy): Subscription {
  visibilitySubscription?.unsubscribe();
  visibilitySubscription = combineLatest([
    store$(store, getMenus),
    store$(store, getDestinationsHistory).pipe(map(destinations => destinations.length > 0), distinctUntilChanged()),
  ]).pipe(
    concatMap(([menus, hasHistory]) => {
      const visible = hasHistory || !menus.some(menu => !menu.destination?.lastUsed);
      return forkJoin(menus.map(menu => saveContextMenu({ id: menu.id, visible: !menu.destination?.lastUsed || visible }, true))).pipe(
        catchError((error: unknown) => {
          LoggerService.error('Failed to update last-used destination menu visibility.', error);
          return EMPTY;
        }),
      );
    }),
  ).subscribe();
  return visibilitySubscription;
}
