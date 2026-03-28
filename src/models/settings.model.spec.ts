import {
  ActionScope,
  ConnectionFormat,
  ConnectionType,
  defaultAdvancedSettings,
  defaultConnection,
  defaultCredentials,
  defaultDownloads,
  defaultGlobal,
  defaultNotifications,
  defaultPolling,
  defaultSettings,
  InterfaceSize,
  Protocol,
  ServiceInstance,
  ServiceInstanceColors,
  ServiceInstanceColorsMap,
  SettingHeader,
  SyncSettingMode,
  ThemeMode,
} from './settings.model';

describe('settings.model', () => {
  describe('defaults', () => {
    it('should have valid defaultCredentials', () => {
      expect(defaultCredentials.type).toBe(ConnectionType.local);
      expect(defaultCredentials.format).toBe(ConnectionFormat.sid);
      expect(defaultCredentials.authVersion).toBe(3);
      expect(defaultCredentials.username).toBe('admin');
    });

    it('should have valid defaultConnection', () => {
      expect(defaultConnection.protocol).toBe(Protocol.http);
      expect(defaultConnection.path).toBe('diskstation');
      expect(defaultConnection.port).toBe(5000);
      expect(defaultConnection.rememberMe).toBe(true);
      expect(defaultConnection.autoLogin).toBe(true);
    });

    it('should have valid defaultPolling', () => {
      expect(defaultPolling.enabled).toBe(true);
      expect(defaultPolling.background.interval).toBe(20000);
      expect(defaultPolling.popup.interval).toBe(3000);
    });

    it('should have valid defaultNotifications', () => {
      expect(defaultNotifications.count.enabled).toBe(true);
      expect(defaultNotifications.snack.enabled).toBe(true);
      expect(defaultNotifications.banner.enabled).toBe(true);
    });

    it('should have valid defaultGlobal', () => {
      expect(defaultGlobal.theme).toBe(ThemeMode.auto);
      expect(defaultGlobal.actions).toBe(ActionScope.all);
      expect(defaultGlobal.interface.size).toBe(InterfaceSize.normal);
    });

    it('should have valid defaultDownloads', () => {
      expect(defaultDownloads.enabled).toBe(true);
      expect(defaultDownloads.intercept.enabled).toBe(false);
      expect(defaultDownloads.intercept.extensions.length).toBeGreaterThan(0);
    });

    it('should have valid defaultAdvancedSettings', () => {
      expect(defaultAdvancedSettings.logging.enabled).toBe(true);
    });

    it('should compose defaultSettings from all defaults', () => {
      expect(defaultSettings.connection).toBe(defaultConnection);
      expect(defaultSettings.polling).toBe(defaultPolling);
      expect(defaultSettings.notifications).toBe(defaultNotifications);
      expect(defaultSettings.global).toBe(defaultGlobal);
      expect(defaultSettings.downloads).toBe(defaultDownloads);
      expect(defaultSettings.advanced).toBe(defaultAdvancedSettings);
    });
  });

  describe('enums', () => {
    it('should have all SettingHeader values', () => {
      expect(Object.values(SettingHeader)).toContain('connection');
      expect(Object.values(SettingHeader)).toContain('notification');
      expect(Object.values(SettingHeader)).toContain('advanced');
    });

    it('should have all SyncSettingMode values', () => {
      expect(SyncSettingMode.sync).toBe('sync');
      expect(SyncSettingMode.local).toBe('local');
    });
  });

  describe('serviceInstanceColorsMap', () => {
    it('should map all ServiceInstance values', () => {
      for (const instance of Object.values(ServiceInstance)) {
        expect(ServiceInstanceColorsMap[instance]).toBeDefined();
      }
    });

    it('should have correct mappings', () => {
      expect(ServiceInstanceColorsMap[ServiceInstance.Background]).toBe(ServiceInstanceColors.Background);
      expect(ServiceInstanceColorsMap[ServiceInstance.Popup]).toBe(ServiceInstanceColors.Popup);
    });
  });
});
