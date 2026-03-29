import { ColorLevel, ColorLevelCss, getColorFromLevel, getLevelFromColor } from './material-ui.model';

describe('material-ui.model', () => {
  describe('getColorFromLevel', () => {
    it('should return hex color for each level', () => {
      expect(getColorFromLevel(ColorLevel.primary)).toBe(ColorLevelCss.primary);
      expect(getColorFromLevel(ColorLevel.error)).toBe(ColorLevelCss.error);
      expect(getColorFromLevel(ColorLevel.info)).toBe(ColorLevelCss.info);
      expect(getColorFromLevel(ColorLevel.success)).toBe(ColorLevelCss.success);
      expect(getColorFromLevel(ColorLevel.warning)).toBe(ColorLevelCss.warning);
      expect(getColorFromLevel(ColorLevel.secondary)).toBe(ColorLevelCss.secondary);
    });

    it('should return undefined for undefined input', () => {
      expect(getColorFromLevel(undefined)).toBeUndefined();
    });
  });

  describe('getLevelFromColor', () => {
    it('should return level for each known color', () => {
      expect(getLevelFromColor('#f44336')).toBe(ColorLevel.error);
      expect(getLevelFromColor('#29b6f6')).toBe(ColorLevel.info);
      expect(getLevelFromColor('#66bb6a')).toBe(ColorLevel.success);
    });

    it('should return undefined for unknown color', () => {
      expect(getLevelFromColor('#000000')).toBeUndefined();
    });
  });
});
