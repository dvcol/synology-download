import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StateSlice } from '../../models';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import { syncLoggedReducer } from '../reducers';

export interface StateReducers<S = StateSlice> extends SliceCaseReducers<S> {
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
    setLogged: syncLoggedReducer,
    setPopup: (state, { payload: popup }) => ({ ...state, modal: { ...state.modal, popup } }),
    setOption: (state, { payload: option }) => ({ ...state, modal: { ...state.modal, option } }),
  } as StateReducers,
});
