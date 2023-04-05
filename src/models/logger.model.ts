export enum LoggingLevel {
  trace = 0,
  debug = 1,
  info = 2,
  warn = 3,
  error = 4,
}

export const LoggingLevelLevelKeys = {
  [LoggingLevel.trace]: 'trace',
  [LoggingLevel.debug]: 'debug',
  [LoggingLevel.info]: 'info',
  [LoggingLevel.warn]: 'warn',
  [LoggingLevel.error]: 'error',
};
