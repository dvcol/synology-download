/**
 * Enumeration for color level
 */
export enum ColorLevel {
  primary = 'primary',
  secondary = 'secondary',
  error = 'error',
  info = 'info',
  success = 'success',
  warning = 'warning',
}

export const ColorLevelMap: Record<ColorLevel, string> = {
  [ColorLevel.secondary]: '#ce93d8',
  [ColorLevel.error]: '#f44336',
  [ColorLevel.info]: '#29b6f6',
  [ColorLevel.success]: '#66bb6a',
  [ColorLevel.warning]: '#ffa726',
  [ColorLevel.primary]: '#90caf9',
};

/**
 * get hex color from color level
 */
export const getColorFromLevel = (color?: ColorLevel): string | undefined => {
  return color ? ColorLevelMap[color] : color;
};

export const ColorMap: Record<string, ColorLevel> = {
  '#ce93d8': ColorLevel.secondary,
  '#f44336': ColorLevel.error,
  '#29b6f6': ColorLevel.info,
  '#66bb6a': ColorLevel.success,
  '#ffa726': ColorLevel.warning,
  '#90caf9': ColorLevel.primary,
};

/**
 * get colorLevel from color level
 */
export const getLevelFromColor = (color: string): ColorLevel | undefined => {
  return ColorMap[color];
};

export enum MaterialIcon {
  add = 'add',
  folder = 'folder',
  music = 'music',
  musicLibrary = 'musicLibrary',
  video = 'video',
  videoLibrary = 'videoLibrary',
  photo = 'photo',
  photoLibrary = 'photoLibrary',
  document = 'document',
  game = 'game',
  secure = 'secure',
  private = 'private',
  server = 'server',
  download = 'download',
  history = 'history',
}

export const MaterialIconMap: Record<MaterialIcon, string> = {
  [MaterialIcon.add]: 'Add',
  [MaterialIcon.folder]: 'Folder',
  [MaterialIcon.music]: 'Music',
  [MaterialIcon.musicLibrary]: 'Music library',
  [MaterialIcon.video]: 'Video',
  [MaterialIcon.videoLibrary]: 'Video Library',
  [MaterialIcon.photo]: 'Photo',
  [MaterialIcon.photoLibrary]: 'Photo Library',
  [MaterialIcon.document]: 'Document',
  [MaterialIcon.game]: 'Game',
  [MaterialIcon.secure]: 'Secure',
  [MaterialIcon.private]: 'Private',
  [MaterialIcon.server]: 'Server',
  [MaterialIcon.download]: 'Download',
  [MaterialIcon.history]: 'History',
};
