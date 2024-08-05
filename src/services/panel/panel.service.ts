import type { SearchInputRef } from '@src/components/common/inputs/search-input';

export class PanelService {
  private static _searchInputRef?: SearchInputRef;

  private static get searchInput() {
    if (!PanelService._searchInputRef) throw new Error('Search input ref is not set.');
    return PanelService._searchInputRef;
  }

  static get visible() {
    return this.searchInput.visible;
  }

  static get focused() {
    return this.searchInput.focused;
  }

  static init(searchInputRef: SearchInputRef) {
    PanelService._searchInputRef = searchInputRef;
  }

  static destroy() {
    PanelService._searchInputRef = undefined;
  }

  static async search(filter?: string) {
    await this.searchInput.focus();
    if (filter) this.searchInput.setFilter(filter);
  }

  static async focus() {
    if (this.focused) return;
    await this.searchInput.focus();
  }

  static async clear() {
    this.searchInput.clear();
  }
}
