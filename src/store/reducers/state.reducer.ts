import { localSet } from '@dvcol/web-extension-utils';

import type { StateSlice } from '@src/models';

import { stateSlice } from '../slices/state.slice';

import type { StateReducers } from '../slices/state.slice';

export const syncLoggedReducer: StateReducers['setLogged'] = (state, { payload: logged }) => {
  // TODO : move to thunk ?
  localSet<Pick<StateSlice, 'logged'>>(stateSlice.name, { logged }).subscribe(() => console.debug('State sync success', state));
  return { ...state, logged };
};
