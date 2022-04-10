import { stateSlice } from '../slices/state.slice';

// Action creators are generated for each case reducer function
const { setLogged, setSid, setPopup, setOption, addLoading, removeLoading, resetLoading } = stateSlice.actions;

// Export as named constants
export { setLogged, setSid, setPopup, setOption, addLoading, removeLoading, resetLoading };
