import { settingsSlice } from '../slices';

// Action creators are generated for each case reducer function
const {
  setSettings,
  syncSettings,
  setConnection,
  syncConnection,
  syncPolling,
  syncNotifications,
  syncRememberMe,
  resetSettings,
  saveContextMenu,
  removeContextMenu,
  resetContextMenu,
  saveTaskTab,
  removeTaskTab,
  resetTaskTabs,
  saveQuickMenu,
  removeQuickMenu,
  resetQuickMenus,
  syncInterface,
} = settingsSlice.actions;

// Export as named constants
export {
  setSettings,
  syncSettings,
  setConnection,
  syncConnection,
  syncPolling,
  syncNotifications,
  syncRememberMe,
  resetSettings,
  saveContextMenu,
  removeContextMenu,
  resetContextMenu,
  saveTaskTab,
  removeTaskTab,
  resetTaskTabs,
  saveQuickMenu,
  removeQuickMenu,
  resetQuickMenus,
  syncInterface,
};
