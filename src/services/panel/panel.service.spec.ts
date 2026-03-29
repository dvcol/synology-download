/* eslint-disable ts/no-unsafe-argument */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PanelService } from './panel.service';

function createMockRef(overrides: Partial<{
  visible: boolean;
  focused: boolean;
  focus: () => Promise<void>;
  blur: () => Promise<void>;
  clear: () => void;
  setFilter: (v: string) => void;
}> = {}) {
  return {
    visible: false,
    focused: false,
    focus: vi.fn(async () => undefined),
    blur: vi.fn(async () => undefined),
    clear: vi.fn(),
    setFilter: vi.fn(),
    inputRef: { current: null },
    ...overrides,
  };
}

describe('panelService', () => {
  beforeEach(() => {
    PanelService.destroy();
  });

  describe('init / destroy', () => {
    it('should set the search input ref on init', () => {
      const ref = createMockRef({ visible: true });
      PanelService.init(ref as any);
      expect(PanelService.visible).toBe(true);
    });

    it('should clear the ref on destroy', () => {
      const ref = createMockRef();
      PanelService.init(ref as any);
      PanelService.destroy();
      expect(() => PanelService.visible).toThrow('Search input ref is not set.');
    });
  });

  describe('search()', () => {
    it('should call focus and setFilter when filter is provided', async () => {
      const ref = createMockRef();
      PanelService.init(ref as any);

      await PanelService.search('test-query');

      expect(ref.focus).toHaveBeenCalled();
      expect(ref.setFilter).toHaveBeenCalledWith('test-query');
    });

    it('should call focus but NOT setFilter when no filter is provided', async () => {
      const ref = createMockRef();
      PanelService.init(ref as any);

      await PanelService.search();

      expect(ref.focus).toHaveBeenCalled();
      expect(ref.setFilter).not.toHaveBeenCalled();
    });
  });

  describe('focus()', () => {
    it('should call focus on the ref when not already focused', async () => {
      const ref = createMockRef({ focused: false });
      PanelService.init(ref as any);

      await PanelService.focus();

      expect(ref.focus).toHaveBeenCalled();
    });

    it('should skip focus when already focused', async () => {
      const ref = createMockRef({ focused: true });
      PanelService.init(ref as any);

      await PanelService.focus();

      expect(ref.focus).not.toHaveBeenCalled();
    });
  });

  describe('clear()', () => {
    it('should call clear on the ref', async () => {
      const ref = createMockRef();
      PanelService.init(ref as any);

      await PanelService.clear();

      expect(ref.clear).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should throw when accessing visible without init', () => {
      expect(() => PanelService.visible).toThrow('Search input ref is not set.');
    });

    it('should throw when accessing focused without init', () => {
      expect(() => PanelService.focused).toThrow('Search input ref is not set.');
    });

    it('should throw when calling search without init', async () => {
      await expect(PanelService.search()).rejects.toThrow('Search input ref is not set.');
    });

    it('should throw when calling focus without init', async () => {
      await expect(PanelService.focus()).rejects.toThrow('Search input ref is not set.');
    });

    it('should throw when calling clear without init', async () => {
      await expect(PanelService.clear()).rejects.toThrow('Search input ref is not set.');
    });
  });
});
