import { stateSlice } from '../slices/state.slice';

// Action creators are generated for each case reducer function
const {
  restoreState,
  setLogged,
  setSid,
  setPopup,
  setOption,
  setContentMenu,
  setContentDialog,
  addLoading,
  removeLoading,
  resetLoading,
  setBadge,
  addFolderHistory,
  addDestinationHistory,
  addLogHistory,
  resetLogHistory,
  syncDownloadState,
} = stateSlice.actions;

// Export as named constants
export {
  restoreState,
  setLogged,
  setSid,
  setPopup,
  setOption,
  setContentMenu,
  setContentDialog,
  addLoading,
  removeLoading,
  resetLoading,
  setBadge,
  addFolderHistory,
  addDestinationHistory,
  addLogHistory,
  resetLogHistory,
  syncDownloadState,
};
