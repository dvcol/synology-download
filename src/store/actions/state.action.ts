import { stateSlice } from '../slices/state.slice';

// Action creators are generated for each case reducer function
const {
  restoreState,
  setLogged,
  setSid,
  setPopup,
  setOption,
  setStandalone,
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
  setApi,
} = stateSlice.actions;

// Export as named constants
export {
  restoreState,
  setLogged,
  setSid,
  setPopup,
  setOption,
  setStandalone,
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
  setApi,
};
