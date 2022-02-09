import { stateSlice } from '../slices';

// Action creators are generated for each case reducer function
const { setLogged, setPopup, setOption, addLoading, removeLoading } = stateSlice.actions;

// Export as named constants
export { setLogged, setPopup, setOption, addLoading, removeLoading };
