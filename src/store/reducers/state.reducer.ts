import { StateReducers, stateSlice } from '../slices';

export const syncLoggedReducer: StateReducers['setLogged'] = (state, { payload: logged }) => {
  // TODO : move to thunk ?
  chrome.storage.sync.set({ [stateSlice.name]: JSON.stringify({ logged }) }, () => console.debug('State sync success', state));
  return { ...state, logged };
};
