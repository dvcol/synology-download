import { settingsSlice } from '../slices/settings.slice';

// Action creators are generated for each case reducer function
const {
  setSettings,
  syncSettings,
  syncDeviceId,
  syncConnection,
  syncPolling,
  syncNotifications,
  syncRememberMe,
  resetSettings,
  saveContextMenu,
  removeContextMenu,
  resetContextMenu,
  saveContentTab,
  removeContentTab,
  resetContentTabs,
  saveQuickMenu,
  removeQuickMenu,
  resetQuickMenus,
  syncInterface,
  syncDownloads,
} = settingsSlice.actions;

// Export as named constants
export {
  setSettings,
  syncSettings,
  syncDeviceId,
  syncConnection,
  syncPolling,
  syncNotifications,
  syncRememberMe,
  resetSettings,
  saveContextMenu,
  removeContextMenu,
  resetContextMenu,
  saveContentTab,
  removeContentTab,
  resetContentTabs,
  saveQuickMenu,
  removeQuickMenu,
  resetQuickMenus,
  syncInterface,
  syncDownloads,
};
