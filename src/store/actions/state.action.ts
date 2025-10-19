import { stateSlice } from '../slices/state.slice';

// Action creators are generated for each case reducer function
const {
  restoreState,
  setLogged,
  setSid,
  setPopup,
  setPanel,
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
  addDestinationHistory,
  addFolderHistory,
  addLoading,
  addLogHistory,
  removeLoading,
  resetLoading,
  resetLogHistory,
  restoreState,
  setApi,
  setBadge,
  setContentDialog,
  setContentMenu,
  setLogged,
  setOption,
  setPanel,
  setPopup,
  setSid,
  setStandalone,
  syncDownloadState,
};
