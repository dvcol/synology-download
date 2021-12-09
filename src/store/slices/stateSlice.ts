import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateSlice } from '../../models';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';

interface StateReducers<S = StateSlice> extends SliceCaseReducers<S> {
  setLogged: CaseReducer<S, PayloadAction<boolean>>;
  setPopup: CaseReducer<S, PayloadAction<boolean>>;
  setOption: CaseReducer<S, PayloadAction<boolean>>;
}

const initialState: StateSlice = {
  logged: false,
  modal: {
    popup: false,
    option: false,
  },
};

export const stateSlice = createSlice<StateSlice, StateReducers, 'state'>({
  name: 'state',
  initialState,
  reducers: {
    setLogged: (state, { payload: logged }) => {
      chrome.storage.sync.set({ [stateSlice.name]: JSON.stringify({ logged }) }, () => console.debug('State sync success', state));
      return { ...state, logged };
    },
    setPopup: (state, { payload: popup }) => ({ ...state, modal: { ...state.modal, popup } }),
    setOption: (state, { payload: option }) => ({ ...state, modal: { ...state.modal, option } }),
  } as StateReducers,
});

// Action creators are generated for each case reducer function
export const { setLogged, setPopup, setOption } = stateSlice.actions;
