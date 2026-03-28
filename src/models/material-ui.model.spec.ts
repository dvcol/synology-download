import {
  ColorLevel,
  ColorLevelCss,
  ColorLevelMap,
  ColorMap,
  getColorFromLevel,
  getLevelFromColor,
  MaterialIcon,
  MaterialIconMap,
} from './material-ui.model';

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

  describe('colorLevelMap', () => {
    it('should have an entry for every ColorLevel', () => {
      for (const level of Object.values(ColorLevel)) {
        expect(ColorLevelMap[level]).toBeDefined();
      }
    });
  });

  describe('colorMap', () => {
    it('should be the inverse of ColorLevelMap', () => {
      for (const [level, color] of Object.entries(ColorLevelMap)) {
        expect(ColorMap[color]).toBe(level);
      }
    });
  });

  describe('materialIconMap', () => {
    it('should have a label for every MaterialIcon', () => {
      for (const icon of Object.values(MaterialIcon)) {
        expect(MaterialIconMap[icon]).toBeDefined();
        expect(typeof MaterialIconMap[icon]).toBe('string');
      }
    });
  });
});
