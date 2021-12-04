import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModalSlice } from '../../models';
import { SliceCaseReducers } from '@reduxjs/toolkit/src/createSlice';
import { CaseReducer } from '@reduxjs/toolkit/src/createReducer';

interface ModalReducers<S = ModalSlice> extends SliceCaseReducers<S> {
  setPopup: CaseReducer<S, PayloadAction<boolean>>;
  setOption: CaseReducer<S, PayloadAction<boolean>>;
}

const initialState: ModalSlice = { popup: false, option: false };

export const modalSlice = createSlice<ModalSlice, ModalReducers, 'modal'>({
  name: 'modal',
  initialState,
  reducers: {
    setPopup: (state, { payload: popup }) => ({ ...state, popup }),
    setOption: (state, { payload: option }) => ({ ...state, option }),
  } as ModalReducers,
});

// Action creators are generated for each case reducer function
export const { setPopup, setOption } = modalSlice.actions;
