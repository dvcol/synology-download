import { stateSlice } from '../slices/state.slice';

// Action creators are generated for each case reducer function
const { restoreState, setLogged, setSid, setPopup, setOption, addLoading, removeLoading, resetLoading, setBadge, addDestinationHistory } =
  stateSlice.actions;

// Export as named constants
export { restoreState, setLogged, setSid, setPopup, setOption, addLoading, removeLoading, resetLoading, setBadge, addDestinationHistory };
