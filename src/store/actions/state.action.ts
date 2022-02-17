import { stateSlice } from '../slices';

// Action creators are generated for each case reducer function
const { setLogged, setSid, setPopup, setOption, addLoading, removeLoading } = stateSlice.actions;

// Export as named constants
export { setLogged, setSid, setPopup, setOption, addLoading, removeLoading };
