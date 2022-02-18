import { StateReducers, stateSlice } from '../slices';
import { syncSet } from '@src/utils';
import { StateSlice } from '@src/models';

export const syncLoggedReducer: StateReducers['setLogged'] = (state, { payload: logged }) => {
  // TODO : move to thunk ?
  syncSet<Pick<StateSlice, 'logged'>>(stateSlice.name, { logged }).subscribe(() => console.debug('State sync success', state));
  return { ...state, logged };
};
