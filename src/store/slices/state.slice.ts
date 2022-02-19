import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';

import { StateSlice } from '@src/models';
import { syncLoggedReducer } from '@src/store/reducers';

export interface StateReducers<S = StateSlice> extends SliceCaseReducers<S> {
  setLogged: CaseReducer<S, PayloadAction<boolean>>;
  setDeviceId: CaseReducer<S, PayloadAction<Partial<string | undefined>>>;
  setSid: CaseReducer<S, PayloadAction<string | undefined>>;
  setPopup: CaseReducer<S, PayloadAction<boolean>>;
  setOption: CaseReducer<S, PayloadAction<boolean>>;
  addLoading: CaseReducer<S, PayloadAction<number | undefined>>;
  removeLoading: CaseReducer<S, PayloadAction<number | undefined>>;
}

const initialState: StateSlice = {
  logged: false,
  sid: undefined,
  modal: {
    popup: false,
    option: false,
  },
  loading: 0,
};

export const stateSlice = createSlice<StateSlice, StateReducers, 'state'>({
  name: 'state',
  initialState,
  reducers: {
    setLogged: syncLoggedReducer,

    setSid: (state, { payload: sid }) => ({ ...state, sid }),
    setPopup: (state, { payload: popup }) => ({ ...state, modal: { ...state.modal, popup } }),
    setOption: (state, { payload: option }) => ({ ...state, modal: { ...state.modal, option } }),
    addLoading: (state, { payload }) => ({ ...state, loading: state.loading + (payload ?? 1) }),
    removeLoading: (state, { payload }) => ({ ...state, loading: state.loading - (payload ?? 1) }),
  } as StateReducers,
});
