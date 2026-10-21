/// <reference types="chrome" />
import englishContextMenu from '../../../../i18n/en/panel/settings/interface/settings-context-menu.json';
import englishContextMenus from '../../../../i18n/en/panel/settings/interface/settings-context-menus.json';
import englishQuickMenus from '../../../../i18n/en/panel/settings/interface/settings-quick-menus.json';
import chineseContextMenu from '../../../../i18n/zh/panel/settings/interface/settings-context-menu.json';
import chineseContextMenus from '../../../../i18n/zh/panel/settings/interface/settings-context-menus.json';
import chineseQuickMenus from '../../../../i18n/zh/panel/settings/interface/settings-quick-menus.json';
import { defaultContextMenu } from '../../../../models/menu.model';
import { defaultSettings } from '../../../../models/settings.model';
import { setSettings } from '../../../../store/actions/settings.action';
import { store } from '../../../../store/store';
import { renderWithProviders } from '../../../../test/render-helper';
import { SettingsContextMenu } from './settings-context-menu';
import { SettingsContextMenus } from './settings-context-menus';
import { SettingsQuickMenus } from './settings-quick-menus';

const englishMessages: Record<string, { message: string }> = { ...englishContextMenu, ...englishContextMenus, ...englishQuickMenus };
const chineseMessages: Record<string, { message: string }> = { ...chineseContextMenu, ...chineseContextMenus, ...chineseQuickMenus };

beforeEach(() => {
  store.dispatch(setSettings(defaultSettings));
  vi.spyOn(chrome.i18n, 'getMessage').mockImplementation(messageName => chineseMessages[messageName]?.message ?? englishMessages[messageName]?.message ?? messageName);
});

afterEach(() => vi.restoreAllMocks());

describe('chinese link-interception and destination settings', () => {
  it.each([
    { name: 'context-menu editor', english: englishContextMenu, chinese: chineseContextMenu },
    { name: 'context-menu summary', english: englishContextMenus, chinese: chineseContextMenus },
    { name: 'quick-menu interception', english: englishQuickMenus, chinese: chineseQuickMenus },
  ])('provides every English key in Chinese for the $name', ({ english, chinese }) => {
    expect.assertions(2);
    expect(Object.keys(chinese).sort()).toEqual(Object.keys(english).sort());
    expect(Object.values(chinese).every(({ message }) => message.trim().length > 0)).toBe(true);
  });

  it('renders the interception controls and opt-in guidance in Chinese', () => {
    expect.assertions(4);
    const { getByText } = renderWithProviders(<SettingsQuickMenus />);
    expect(getByText('快捷菜单拦截')).toBeTruthy();
    expect(getByText('启用或禁用快捷菜单拦截功能。')).toBeTruthy();
    expect(getByText('支持的链接类型')).toBeTruthy();
    expect(getByText('选择要拦截的协议链接和 HTTP(S) 文件扩展名。Torrent 和 NZB 文件默认不拦截，需手动启用；按住修饰键点击文件链接时保留浏览器的默认行为。')).toBeTruthy();
  });

  it('renders both folder switches and their default-destination guidance in Chinese', () => {
    expect.assertions(4);
    const { getByRole, getByText } = renderWithProviders(<SettingsContextMenu menu={defaultContextMenu} onRemove={async () => {}} />);
    expect((getByRole('switch', { name: '自定义文件夹' }) as HTMLInputElement).checked).toBe(false);
    expect((getByRole('switch', { name: '上次使用的文件夹' }) as HTMLInputElement).checked).toBe(false);
    expect(getByText('选择固定的目标文件夹。两个文件夹开关均关闭时，使用 NAS 的默认文件夹。')).toBeTruthy();
    expect(getByText('使用最近一次成功创建任务时的目标文件夹。')).toBeTruthy();
  });

  it('renders the saved last-used destination summary in Chinese', () => {
    expect.assertions(1);
    store.dispatch(setSettings({ ...defaultSettings, menus: [{ ...defaultContextMenu, destination: { custom: false, lastUsed: true } }] }));
    const { getByText } = renderWithProviders(<SettingsContextMenus />);
    expect(getByText('上次使用的目标文件夹')).toBeTruthy();
  });
});
